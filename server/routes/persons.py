import re
import hashlib
from fastapi import APIRouter, Depends, Query, HTTPException
from db import db
from auth import get_current_user

router = APIRouter(prefix="/api/persons", tags=["Persons & Case Search"])


def normalize_text(text: str) -> str:
    if not text:
        return ""
    cleaned = re.sub(r'[\-_/\\.,:;()\[\]{}"\'`!?+@#$^&*~|=]', ' ', str(text))
    return " ".join(cleaned.split()).casefold()


def is_text_matching(query: str, target_text: str) -> bool:
    if not query or not query.strip():
        return True

    norm_query = normalize_text(query)
    norm_target = normalize_text(target_text)

    if not norm_query or not norm_target:
        return False

    if norm_query in norm_target:
        return True

    query_words = norm_query.split()
    return all(w in norm_target for w in query_words)


def get_text_snippet(query: str, full_text: str, max_length: int = 180) -> str:
    if not full_text or not query:
        return ""
    norm_q = normalize_text(query)
    norm_text = normalize_text(full_text)
    pos = norm_text.find(norm_q)
    if pos != -1:
        start = max(0, pos - 40)
        end = min(len(full_text), pos + len(query) + 120)
        snippet = full_text[start:end].replace('\n', ' ').strip()
        return f"...{snippet}..."
    words = norm_q.split()
    for w in words:
        p = norm_text.find(w)
        if p != -1:
            start = max(0, p - 40)
            end = min(len(full_text), p + len(w) + 120)
            snippet = full_text[start:end].replace('\n', ' ').strip()
            return f"...{snippet}..."
    return full_text[:max_length].replace('\n', ' ').strip() + "..."


def _authorized_case_ids(user: dict) -> set[str]:
    user_id = user["id"]
    prefix = user.get("prefix")

    if prefix in ("AD", "JU"):
        rows = db.query("SELECT caseId FROM cases")
    elif prefix == "LW":
        rows = db.query("SELECT caseId FROM cases WHERE assignedLawyerId = %s", (user_id,))
    else:
        rows = db.query(
            "SELECT caseId FROM user_cases WHERE userId = %s UNION "
            "SELECT caseId FROM case_officers WHERE officerId = %s UNION "
            "SELECT caseId FROM uploaded_files WHERE uploadedByOfficerId = %s",
            (user_id, user_id, user_id),
        )
    case_ids = {row["caseId"] for row in rows}

    if prefix == "FO":
        dispatched = db.query("SELECT caseId FROM cases WHERE status = 'FORENSIC_REVIEW'")
        dispatched_ids = {row["caseId"] for row in dispatched}
        case_ids |= dispatched_ids

    return case_ids


def _case_summary(case: dict, officers: list[dict], files: list[dict]) -> dict:
    return {
        "caseId": case["caseId"],
        "title": case.get("title") or case["caseId"],
        "incidentLocation": case.get("incidentLocation") or "",
        "status": case.get("status") or "",
        "assignedLawyerId": case.get("assignedLawyerId"),
        "assignedLawyerName": case.get("assignedLawyerName"),
        "assignedOfficerIds": [row["officerId"] for row in officers],
        "fileCount": len(files),
    }


def _indexed_results(user: dict, query: str = "") -> list[dict]:
    case_ids = _authorized_case_ids(user)
    if not case_ids:
        return []

    cases = db.query("SELECT * FROM cases")
    cases = [case for case in cases if case["caseId"] in case_ids]
    case_map = {case["caseId"]: case for case in cases}

    files = db.query("SELECT * FROM uploaded_files")
    files = [file for file in files if file["caseId"] in case_ids]

    users = db.query(
        "SELECT id, name, rankTitle, role, prefix, department, station, badgeNumber, clearance FROM users"
    )
    results = []
    query_lower = query.strip()

    # 1. Official Registered Personnel Search
    for person in users:
        person_id = person["id"]
        assigned_rows = db.query(
            "SELECT caseId FROM user_cases WHERE userId = %s UNION "
            "SELECT caseId FROM case_officers WHERE officerId = %s UNION "
            "SELECT caseId FROM cases WHERE assignedLawyerId = %s UNION "
            "SELECT caseId FROM uploaded_files WHERE uploadedByOfficerId = %s",
            (person_id, person_id, person_id, person_id),
        )
        involved_case_ids = {row["caseId"] for row in assigned_rows} & case_ids
        if not involved_case_ids and person_id != user["id"]:
            continue

        name = person.get("name") or person_id
        searchable = " ".join((
            name, person_id, person.get("rankTitle") or "", person.get("role") or "",
            person.get("badgeNumber") or "", person.get("department") or "", person.get("station") or "",
        ))

        matching_case_ids = set()
        for c_id in involved_case_ids:
            c_data = case_map.get(c_id, {})
            c_files = [f for f in files if f["caseId"] == c_id]
            case_text = " ".join([
                c_data.get("caseId") or "",
                c_data.get("title") or "",
                c_data.get("incidentLocation") or "",
                c_data.get("status") or ""
            ] + [
                f"{(f.get('fileName') or '')} {(f.get('description') or '')} {(f.get('category') or '')} {(f.get('fileId') or '')} {(f.get('uploadedByOfficerName') or '')} {(f.get('fileText') or '')}"
                for f in c_files
            ])

            if is_text_matching(query_lower, case_text):
                matching_case_ids.add(c_id)

        if query_lower and not is_text_matching(query_lower, searchable) and not matching_case_ids:
            continue

        target_case_ids = matching_case_ids if (query_lower and not is_text_matching(query_lower, searchable)) else involved_case_ids
        person_cases = []
        for c_id in sorted(target_case_ids):
            c_data = case_map[c_id]
            case_files = [f for f in files if f["caseId"] == c_id]
            officers = db.query("SELECT officerId FROM case_officers WHERE caseId = %s", (c_id,))
            case_info = _case_summary(c_data, officers, case_files)
            case_info["roleInCase"] = "Assigned case personnel"
            case_info["matchReason"] = "Personnel profile or associated case files match search criteria."

            matching_files_list = []
            for f in case_files:
                f_text = " ".join((
                    f.get("fileName") or "",
                    f.get("description") or "",
                    f.get("category") or "",
                    f.get("fileId") or "",
                    f.get("uploadedByOfficerName") or "",
                    f.get("uploadedByOfficerId") or "",
                    f.get("fileText") or "",
                ))
                if not query_lower or is_text_matching(query_lower, f_text) or f.get("uploadedByOfficerId") == person_id:
                    desc = f.get("description") or ""
                    if query_lower and f.get("fileText") and is_text_matching(query_lower, f["fileText"]):
                        snip = get_text_snippet(query_lower, f["fileText"])
                        desc = f"{desc} | Content Snippet: {snip}" if desc else f"Content Snippet: {snip}"

                    matching_files_list.append({
                        "fileId": f.get("fileId"),
                        "fileName": f.get("fileName"),
                        "category": f.get("category"),
                        "uploadTime": f.get("uploadTime"),
                        "description": desc
                    })

            case_info["matchingFiles"] = matching_files_list
            person_cases.append(case_info)

        if person_cases or not query_lower or is_text_matching(query_lower, searchable):
            results.append({
                "id": person_id,
                "name": name,
                "rankTitle": person.get("rankTitle") or person.get("role") or "Personnel",
                "role": person.get("role") or "",
                "prefix": person.get("prefix") or "",
                "category": "Official Personnel",
                "department": person.get("department") or "",
                "station": person.get("station") or "",
                "badgeNumber": person.get("badgeNumber") or "",
                "clearance": person.get("clearance") or "",
                "totalCasesInvolved": len(person_cases),
                "cases": person_cases,
            })

    # 2. Subject / Mentioned Person Entity Generation (for query matching entity/files text)
    if query_lower:
        entity_cases_by_id = {}
        for c_id, case in case_map.items():
            case_files = [f for f in files if f["caseId"] == c_id]
            case_text = " ".join([
                case.get("caseId") or "",
                case.get("title") or "",
                case.get("incidentLocation") or ""
            ] + [
                f"{(f.get('fileName') or '')} {(f.get('description') or '')} {(f.get('category') or '')} {(f.get('fileId') or '')} {(f.get('fileText') or '')}"
                for f in case_files
            ])

            if is_text_matching(query_lower, case_text):
                officers = db.query("SELECT officerId FROM case_officers WHERE caseId = %s", (c_id,))
                c_summary = _case_summary(case, officers, case_files)
                c_summary["roleInCase"] = "Subject / Mentioned Entity in Case Evidence"
                c_summary["matchReason"] = "Search query matches entity mentioned inside case document content or file metadata."
                
                m_files = []
                for f in case_files:
                    blob = f"{(f.get('fileName') or '')} {(f.get('description') or '')} {(f.get('category') or '')} {(f.get('fileId') or '')} {(f.get('fileText') or '')}"
                    if is_text_matching(query_lower, blob):
                        desc = f.get("description") or ""
                        if f.get("fileText") and is_text_matching(query_lower, f["fileText"]):
                            snip = get_text_snippet(query_lower, f["fileText"])
                            desc = f"{desc} | Content Snippet: {snip}" if desc else f"Content Snippet: {snip}"
                        
                        m_files.append({
                            "fileId": f.get("fileId"),
                            "fileName": f.get("fileName"),
                            "category": f.get("category"),
                            "uploadTime": f.get("uploadTime"),
                            "description": desc
                        })
                c_summary["matchingFiles"] = m_files
                entity_cases_by_id[c_id] = c_summary

        has_officer_match = any(is_text_matching(query_lower, r["name"]) for r in results)
        if entity_cases_by_id and not has_officer_match:
            ent_hash = hashlib.sha256(query_lower.encode("utf-8")).hexdigest()[:8].upper()
            results.insert(0, {
                "id": f"ENT-{ent_hash}",
                "name": query.strip().title(),
                "rankTitle": "Subject / Mentioned Entity in Case Evidence",
                "role": "CASE_ENTITY",
                "prefix": "ENT",
                "category": "Official Personnel",
                "department": "Cross-Case Evidence Mapping",
                "station": "Case Evidence Vault",
                "badgeNumber": f"ENT-REF-{ent_hash[:6]}",
                "clearance": "Level 1 - Case Details",
                "totalCasesInvolved": len(entity_cases_by_id),
                "cases": list(entity_cases_by_id.values()),
            })

    # 3. Document References Summary Group
    if query_lower:
        matching_files = []
        for file in files:
            case = case_map.get(file["caseId"])
            if not case:
                continue
            case_title = case.get("title") or ""
            case_loc = case.get("incidentLocation") or ""
            file_blob = " ".join((
                file.get("fileName") or "",
                file.get("description") or "",
                file.get("category") or "",
                file.get("fileId") or "",
                file.get("uploadedByOfficerName") or "",
                file.get("uploadedByOfficerId") or "",
                file.get("caseId") or "",
                case_title,
                case_loc,
                file.get("fileText") or "",
            ))

            if is_text_matching(query_lower, file_blob):
                matching_files.append(file)

        by_case = {}
        for file in matching_files:
            case = case_map[file["caseId"]]
            c_id = case["caseId"]
            if c_id not in by_case:
                officers = db.query("SELECT officerId FROM case_officers WHERE caseId = %s", (c_id,))
                by_case[c_id] = _case_summary(case, officers, [f for f in files if f["caseId"] == c_id])
                by_case[c_id].update({
                    "roleInCase": "Matching evidence record",
                    "matchReason": "Search query matches document text content, file name, category, or description.",
                    "matchingFiles": [],
                })
            
            desc = file.get("description") or ""
            if file.get("fileText") and is_text_matching(query_lower, file["fileText"]):
                snip = get_text_snippet(query_lower, file["fileText"])
                desc = f"{desc} | Content Snippet: {snip}" if desc else f"Content Snippet: {snip}"

            by_case[c_id]["matchingFiles"].append({
                "fileId": file.get("fileId"),
                "fileName": file.get("fileName"),
                "category": file.get("category"),
                "uploadTime": file.get("uploadTime"),
                "description": desc
            })

        if by_case:
            reference_id = "MATCH-" + hashlib.sha256(query_lower.encode("utf-8")).hexdigest()[:12]
            results.append({
                "id": reference_id,
                "name": f'Files matching “{query.strip()}”',
                "rankTitle": "Case evidence search result",
                "role": "DOCUMENT_MATCH",
                "prefix": "DOC",
                "category": "Document references",
                "department": "Authorized case records",
                "station": "",
                "badgeNumber": "",
                "clearance": "",
                "totalCasesInvolved": len(by_case),
                "cases": list(by_case.values()),
            })

    return results


@router.get("/all")
def get_all_indexed_persons(current_user: dict = Depends(get_current_user)):
    try:
        people = _indexed_results(current_user)
        return {"success": True, "count": len(people), "persons": people}
    except Exception as err:
        print("[PERSONS ALL ERROR]", err)
        raise HTTPException(status_code=500, detail={"success": False, "message": str(err)})


@router.get("/search")
def search_person_cases(q: str = Query("", min_length=1), current_user: dict = Depends(get_current_user)):
    try:
        query = q.strip()
        if not query:
            raise HTTPException(status_code=422, detail={"success": False, "message": "Enter a name, officer ID, case number, or evidence keyword."})
        results = _indexed_results(current_user, query)
        return {"success": True, "query": query, "count": len(results), "results": results}
    except HTTPException:
        raise
    except Exception as err:
        print("[PERSONS SEARCH ERROR]", err)
        raise HTTPException(status_code=500, detail={"success": False, "message": str(err)})

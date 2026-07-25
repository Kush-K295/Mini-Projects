import re
import lookups


def parseit(rawstr: str, user_batch: str):
    rawstr = (
        rawstr.replace("..", "")
        .replace(".,", ",")
        .replace(",.", ",")
        .replace(" ,", ",")
        .replace(", ", ",")
        .replace("  ", " ")
        .strip()
    )

    if not rawstr:
        return None

    class_type = rawstr.split('-', 1)[0].strip()

    match = re.search(r'\(([^)]+)\)\s*(.+)$', rawstr)
    if match:
        faculty = match.group(1).strip()
        room = match.group(2).strip()
        main_part = rawstr[:match.start()].strip()
    else:
        faculty = "Unknown"
        room = "Unknown"
        main_part = rawstr

    if '-' in main_part:
        after_hyphen = main_part.split('-', 1)[1].strip()
    else:
        after_hyphen = main_part

    electiveInfo = None
    batches_str = ""

    if '[' in after_hyphen:
        start_bracket = after_hyphen.find('[')
        prefix = after_hyphen[:start_bracket].strip()
        parts = prefix.split()
        coursecode = parts[0] if parts else ""

        if len(parts) > 1:
            electiveInfo = " ".join(parts[1:])

        if ']' in after_hyphen:
            end_bracket = after_hyphen.find(']')
        else:
            # Source data is missing its closing ']' — fall back to treating
            # everything after '[' as the batch list instead of losing the row.
            end_bracket = len(after_hyphen)

        bracket_content = after_hyphen[start_bracket + 1:end_bracket].strip()
        extra = after_hyphen[end_bracket + 1:].strip() if end_bracket < len(after_hyphen) else ""

        if extra:
            if '_' in extra:
        
                batches_str = extra.split('_', 1)[1].strip()
            else:
            
                batches_str = bracket_content + ',' + extra
        else:
            batches_str = bracket_content
    else:
        parts = after_hyphen.split()
        coursecode = parts[0] if parts else ""

        if len(parts) > 1:
            batches_str = " ".join(parts[1:]).strip()

    coursecode = coursecode.rstrip('/')


    batch_list = [
        b.strip().rstrip('.')
        for b in re.split(r'[,\s&]+', batches_str)
        if b.strip().rstrip('.')
    ]

    if user_batch not in batch_list:
        return None

    return {
        "type": lookups.get_class_type(class_type),
        "subject": lookups.get_course_name(coursecode),
        "batches": batches_str,
        "elective": electiveInfo,
        "faculty": lookups.get_faculty_name(faculty),
        "room": room,
    }
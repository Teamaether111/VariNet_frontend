from typing import Any, Optional


def generate_queue_decision(
    prediction: dict[str, Any],
) -> Optional[dict[str, str]]:
    label = str(prediction["predicted_wait_label"]).upper()
    wait_minutes = float(prediction["predicted_wait_minutes"])
    waiting_people = int(prediction["waiting_people"])
    gates_open = int(prediction["gates_open"])
    crowd_density = float(prediction["crowd_density"])
    zone_id = str(prediction["zone_id"])
    location = str(prediction["location"])

    explanation = (
        f"The model predicts a wait of {wait_minutes:.1f} minutes at "
        f"{location} ({zone_id}). Inputs include {waiting_people} waiting "
        f"people, {gates_open} open gates and crowd density "
        f"{crowd_density:.2f}."
    )

    if label == "LOW":
        return None
    if label == "MODERATE":
        return {
            "alert_level": "MODERATE",
            "title": f"Queue watch required in {zone_id}",
            "message": f"Queue conditions are becoming busy at {location}.",
            "explanation": explanation,
            "recommended_action": (
                "Monitor every 15 minutes, position volunteers near the "
                "entry line, and prepare another gate if waiting time rises."
            ),
        }
    if label == "HIGH":
        return {
            "alert_level": "HIGH",
            "title": f"High temple queue risk in {zone_id}",
            "message": f"High waiting time is predicted at {location}.",
            "explanation": explanation,
            "recommended_action": (
                "Review safe gate capacity, deploy additional volunteers, "
                "and issue a queue-time advisory to arriving pilgrims."
            ),
        }
    if label == "CRITICAL":
        return {
            "alert_level": "CRITICAL",
            "title": f"Critical temple queue risk in {zone_id}",
            "message": f"Critical queue conditions are predicted at {location}.",
            "explanation": explanation,
            "recommended_action": (
                "Activate the approved crowd-management plan, use holding "
                "areas, review gate capacity, and coordinate temple staff, "
                "police, volunteers and medical teams."
            ),
        }
    return None

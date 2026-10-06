import random

def test_appointment_workflow(client):
    rand_day = random.randint(10, 28)
    date_str = f"2026-11-{rand_day}"

    # 1. Login as Student
    res = client.post("/api/auth/login", json={
        "email": "student@institution.edu.in",
        "password": "Student@Niyojan2026"
    })
    assert res.status_code == 200
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Appointment
    apt_res = client.post("/api/appointments", json={
        "subject": "Lab Permission Request",
        "category": "Lab Access",
        "description": "Requesting access to high performance computing lab.",
        "preferredDate": date_str,
        "preferredTime": "11:00 AM",
        "priority": "High",
        "targetPersona": "Principal"
    }, headers=headers)
    assert apt_res.status_code == 201
    apt_data = apt_res.json()
    apt_id = apt_data["id"]
    assert apt_data["status"] == "PENDING_MEDIATOR"

    # 3. Login as Mediator & Forward
    med_res = client.post("/api/auth/login", json={
        "email": "mediator@institution.edu.in",
        "password": "Mediator@Niyojan2026"
    })
    assert med_res.status_code == 200
    med_token = med_res.json()["access_token"]
    med_headers = {"Authorization": f"Bearer {med_token}"}

    fwd_res = client.post(f"/api/mediator/appointments/{apt_id}/forward", json={
        "remarks": "Verified lab requirement."
    }, headers=med_headers)
    assert fwd_res.status_code == 200
    assert fwd_res.json()["status"] == "FORWARDED_TO_PRINCIPAL"

    # 4. Login as Principal & Approve
    prin_res = client.post("/api/auth/login", json={
        "email": "principal@institution.edu.in",
        "password": "Principal@Niyojan2026"
    })
    assert prin_res.status_code == 200
    prin_token = prin_res.json()["access_token"]
    prin_headers = {"Authorization": f"Bearer {prin_token}"}

    appr_res = client.post(f"/api/principal/appointments/{apt_id}/approve", json={
        "slotTime": "11:00 AM",
        "remarks": "Approved HPC lab permission."
    }, headers=prin_headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "APPROVED"

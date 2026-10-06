def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

def test_login_success(client):
    response = client.post("/api/auth/login", json={
        "email": "student@institution.edu.in",
        "password": "Student@Niyojan2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "student"

def test_login_invalid(client):
    response = client.post("/api/auth/login", json={
        "email": "student@institution.edu.in",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401

def test_register_restricted_role(client):
    response = client.post("/api/auth/register", json={
        "full_name": "Attacker",
        "email": "hacker@test.com",
        "password": "Password123",
        "role": "admin"
    })
    assert response.status_code == 403

def test_register_and_login_success(client):
    reg_payload = {
        "full_name": "New Student",
        "email": "newstudent@institution.edu.in",
        "password": "SecurePassword2026!",
        "role": "student",
        "identifier": "2026CSE999"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 200
    assert reg_res.json()["success"] is True

    login_res = client.post("/api/auth/login", json={
        "email": "newstudent@institution.edu.in",
        "password": "SecurePassword2026!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "newstudent@institution.edu.in"
    assert login_data["user"]["role"] == "student"

def test_register_duplicate_email(client):
    reg_payload = {
        "full_name": "Duplicate Student",
        "email": "student@institution.edu.in",
        "password": "Password123",
        "role": "student"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 409
    assert "already exists" in reg_res.json()["detail"].lower()


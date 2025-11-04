from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
import uuid


app = Flask(__name__)
CORS(app)

# -------------------------------------
# Database connection configuration
# -------------------------------------
db_config = {
    'host': 'localhost',        # or your server IP / domain
    'user': 'root',             # replace with your MySQL username
    'password': 'Atsthinqor@2025', # replace with your MySQL password
    'database': 'ats_system'    # your database name
}

# -------------------------------------
# Create a reusable connection function
# -------------------------------------
def get_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        if connection.is_connected():
            print("✅ MySQL Database connected successfully!")
            return connection
    except Error as e:
        print("❌ Database connection failed:", e)
        return None

# -------------------------------------
# Routes
# -------------------------------------
@app.route('/')
def home():
    return 'ATS Backend is Running! 🚀'

# @app.route('/testdb')
# def test_db():
#     try:
#         conn = get_db_connection()
#         if conn:
#             cursor = conn.cursor()
#             cursor.execute("SHOW DATABASES;")
#             databases = cursor.fetchall()
#             cursor.close()
#             conn.close()
#             return f"✅ Connected Successfully! Databases: {databases}"
#         else:
#             return "❌ Failed to connect to database."
#     except Exception as e:
#         return f"❌ Error: {str(e)}"

import hashlib

def ensure_admin_exists():
    """Check if admin exists; if not, insert Srini as Admin."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if admin already exists
        cursor.execute("SELECT * FROM users WHERE email = %s", ("srini@thinqorsolutions.com",))
        existing_admin = cursor.fetchone()

        if existing_admin:
            print("✅ Admin 'Srini' already exists.")
        else:
            # Hash the password
            hashed_pw = hashlib.sha256("Srini@2025".encode()).hexdigest()

            # Insert new admin
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, role, status)
                VALUES (%s, %s, %s, 'ADMIN', 'ACTIVE')
            """, ("Srini", "srini@thinqorsolutions.com", hashed_pw))
            conn.commit()
            print("✅ Admin 'Srini' inserted successfully.")

        cursor.close()
        conn.close()

    except Exception as e:
        print("❌ Error ensuring admin:", e)


@app.route('/create-user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        role = data.get('role', 'RECRUITER')
        password = data.get('password')

        if not all([name, email, password]):
            return jsonify({"message": "name, email, and password are required"}), 400

        # Hash the password
        password_hash = hashlib.sha256(password.encode()).hexdigest()

        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert new user
        cursor.execute("""
            INSERT INTO usersdata (name, email, phone, role, password_hash)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, email, phone, role, password_hash))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": f"✅ User '{name}' created successfully!"}), 201

    except mysql.connector.IntegrityError:
        return jsonify({"message": "⚠️ Email already exists!"}), 409
    except Exception as e:
        return jsonify({"message": "❌ Error creating user", "error": str(e)}), 500

# -------------------------------
# API: Get All Users (Admin view)
# -------------------------------
@app.route('/get-users', methods=['GET'])
def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, phone, role, status, created_at FROM usersdata")
        users = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify(users), 200
    except Exception as e:
        return jsonify({"message": "❌ Error fetching users", "error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({"message": "❌ Email and password are required"}), 400

        hashed_pw = hashlib.sha256(password.encode()).hexdigest()

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Search in 'users' table (registered users)
        cursor.execute("""
            SELECT id, name, email, role, status 
            FROM users 
            WHERE email = %s AND password_hash = %s AND status = 'ACTIVE'
        """, (email, hashed_pw))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        if user:
            return jsonify({"message": "✅ Login successful", "user": user}), 200
        else:
            return jsonify({"message": "❌ Invalid email or password"}), 401

    except Exception as e:
        return jsonify({"message": "❌ Error during login", "error": str(e)}), 500


@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not all([name, email, password]):
            return jsonify({"message": "❌ All fields (name, email, password) are required"}), 400

        hashed_pw = hashlib.sha256(password.encode()).hexdigest()

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # 1️⃣ Check if email exists in usersdata table (created by admin)
        cursor.execute("SELECT * FROM usersdata WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if not existing_user:
            cursor.close()
            conn.close()
            return jsonify({
                "message": "❌ Signup not allowed. Email not found in admin user list."
            }), 403

        # 2️⃣ Check if already registered in users table
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        already_registered = cursor.fetchone()

        if already_registered:
            cursor.close()
            conn.close()
            return jsonify({
                "message": "⚠️ You have already signed up."
            }), 409

        # 3️⃣ Insert into users table
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role, status)
            VALUES (%s, %s, %s, %s, 'ACTIVE')
        """, (name, email, hashed_pw, existing_user['role']))
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({
            "message": "✅ Signup successful! You can now log in.",
            "user": {"name": name, "email": email, "role": existing_user['role']}
        }), 201

    except Exception as e:
        return jsonify({"message": "❌ Signup error", "error": str(e)}), 500
    
    
@app.route("/requirements", methods=["POST"])
def create_requirement():
    try:
        data = request.get_json()
        req_id = str(uuid.uuid4())

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO requirements
            (id, client_id, title, description, location, skills_required, experience_required, ctc_range, ecto_range, status, created_by)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,'OPEN',%s)
        """, (
            req_id,
            data.get("client_id"),
            data.get("title"),
            data.get("description"),
            data.get("location"),
            data.get("skills_required"),
            data.get("experience_required"),
            data.get("ctc_range"),
            data.get("ecto_range"),
            data.get("created_by")
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Requirement created", "id": req_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/assign-requirement", methods=["POST"])
def assign_requirement():
    try:
        data = request.get_json()
        alloc_id = str(uuid.uuid4())

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO requirement_allocations (id, requirement_id, recruiter_id, assigned_by)
            VALUES (%s, %s, %s, %s)
        """, (
            alloc_id,
            data.get("requirement_id"),
            data.get("recruiter_id"),
            data.get("assigned_by")
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Requirement Assigned"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-requirements", methods=["GET"])
def get_requirements():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM requirements ORDER BY created_at DESC")
    data = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(data)

@app.route('/create-client', methods=['POST'])
def create_client():
    data = request.get_json()
    name = data.get("name")
    contact_person = data.get("contact_person")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address")

    if not name:
        return jsonify({"message": "Client name is required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO clients (name, contact_person, email, phone, address)
        VALUES (%s, %s, %s, %s, %s)
    """, (name, contact_person, email, phone, address))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Client created successfully"}), 201

@app.route('/clients', methods=['GET'])
def get_clients():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM clients ORDER BY id DESC")
        clients = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(clients), 200

    except Exception as e:
        return jsonify({"message": "Error fetching clients", "error": str(e)}), 500



# -------------------------------------
# Run Server
# -------------------------------------
if __name__ == '__main__':
    ensure_admin_exists()
    app.run(debug=True)

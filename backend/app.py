from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3, json
from flask_jwt_extended import *

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "secret"
jwt = JWTManager(app)

def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def home():
    return "API OK"

# REGISTER - Tạo tài khoản mới
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    db = get_db()

    # Kiểm tra username đã tồn tại chưa
    existing = db.execute(
        "SELECT * FROM users WHERE username=?",
        (data["username"],)
    ).fetchone()

    if existing:
        return jsonify({"msg": "Tài khoản đã tồn tại"}), 400

    # Thêm user mới
    db.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (data["username"], data["password"])
    )
    db.commit()

    return jsonify({"msg": "Đăng ký thành công"})

# LOGIN
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    db = get_db()

    user = db.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (data["username"], data["password"])
    ).fetchone()

    if not user:
        return jsonify({"msg": "Sai tài khoản"}), 401

    token = create_access_token(identity=user["username"])
    return jsonify(access_token=token, username=user["username"])

# FOODS
@app.route("/foods")
def foods():
    db = get_db()
    data = db.execute("SELECT * FROM foods").fetchall()

    return jsonify([
        dict(f) for f in data
    ])

# ADD FOOD
@app.route("/foods", methods=["POST"])
@jwt_required()
def add_food():
    data = request.json
    db = get_db()

    db.execute(
        "INSERT INTO foods (name, price, image) VALUES (?, ?, ?)",
        (data["name"], data["price"], data.get("image", ""))
    )
    db.commit()

    return jsonify({"msg": "added"})

# ORDER
@app.route("/order", methods=["POST"])
@jwt_required()
def order():
    user = get_jwt_identity()
    data = request.json

    db = get_db()
    db.execute(
        "INSERT INTO orders (user, items) VALUES (?, ?)",
        (user, json.dumps(data["cart"]))
    )
    db.commit()

    return jsonify({"msg": "order saved"})

# GET ORDERS
@app.route("/orders")
@jwt_required()
def get_orders():
    db = get_db()
    user = get_jwt_identity()

    if user == 'admin':
        orders = db.execute("SELECT * FROM orders ORDER BY id DESC").fetchall()
    else:
        orders = db.execute("SELECT * FROM orders WHERE user=? ORDER BY id DESC", (user,)).fetchall()

    return jsonify([dict(o) for o in orders])

# DELETE FOOD
@app.route("/foods/<int:food_id>", methods=["DELETE"])
@jwt_required()
def delete_food(food_id):
    db = get_db()
    db.execute("DELETE FROM foods WHERE id=?", (food_id,))
    db.commit()
    return jsonify({"msg": "deleted"})

# UPDATE FOOD
@app.route("/foods/<int:food_id>", methods=["PUT"])
@jwt_required()
def update_food(food_id):
    data = request.json
    db = get_db()
    db.execute(
        "UPDATE foods SET name=?, price=?, image=? WHERE id=?",
        (data.get("name"), data.get("price"), data.get("image", ""), food_id)
    )
    db.commit()
    return jsonify({"msg": "updated"})

# STATS
@app.route("/stats")
@jwt_required()
def get_stats():
    db = get_db()
    
    # Total foods
    foods_count = db.execute("SELECT COUNT(*) as count FROM foods").fetchone()["count"]
    
    # Total orders
    orders_count = db.execute("SELECT COUNT(*) as count FROM orders").fetchone()["count"]
    
    # Total users
    users_count = db.execute("SELECT COUNT(*) as count FROM users").fetchone()["count"]
    
    # Total revenue (if price in orders)
    orders = db.execute("SELECT items FROM orders").fetchall()
    total_revenue = 0
    for o in orders:
        try:
            items = json.loads(o["items"])
            for item in items:
                total_revenue += item.get("price", 0) * item.get("quantity", 1)
        except:
            pass
    
    return jsonify({
        "foods_count": foods_count,
        "orders_count": orders_count,
        "users_count": users_count,
        "total_revenue": total_revenue
    })

if __name__ == "__main__":
    app.run(debug=True)
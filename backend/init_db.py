import sqlite3

conn = sqlite3.connect("database.db")
c = conn.cursor()

c.execute("DROP TABLE IF EXISTS users")
c.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)")

c.execute("DROP TABLE IF EXISTS foods")
c.execute("CREATE TABLE foods (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, image TEXT)")

c.execute("DROP TABLE IF EXISTS orders")
c.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, items TEXT, status TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")

c.execute("INSERT INTO users VALUES (NULL, 'admin', '123')")

foods = [
    ("Pizza", 100000, ""),
    ("Burger", 50000, ""),
]

c.executemany("INSERT INTO foods (name, price, image) VALUES (?, ?, ?)", foods)

conn.commit()
conn.close()
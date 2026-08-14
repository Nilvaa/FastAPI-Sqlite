import sqlite3
from database import get_connection

sqlite_conn=sqlite3.connect("backend/inventory.db")
sqlite_cursor=sqlite_conn.cursor()

psql_conn=get_connection()
psql_cursor=psql_conn.cursor()

try:
    # USERS
    psql_cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL
        );
    """)
    psql_cursor.execute("""
        CREATE TABLE IF NOT EXISTS products(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            price INTEGER NOT NULL
            );
    """)

    psql_cursor.execute("""
        CREATE TABLE IF NOT EXISTS cart(
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        pdt_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL
        );
    """)

#migrate data
#users
    sqlite_cursor.execute(
            "SELECT id,username,password_hash,role FROM users"
    )

    users=sqlite_cursor.fetchall()

    for user in users:
        password_hash=user[2]

        psql_cursor.execute("""
            INSERT INTO users
            (id,username,password_hash,role)
            VALUES(%s,%s,%s,%s)
            ON CONFLICT (username) DO NOTHING
        """,(
            user[0],user[1],password_hash,user[3]
        ))

#products
    sqlite_cursor.execute(
        "SELECT id,name,category,quantity,price FROM products"
    )

    products=sqlite_cursor.fetchall()

    for pdt in products:
        psql_cursor.execute("""
            INSERT INTO products
            (id,name,category,quantity,price)
            VALUES(%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """,pdt)

#cart
    sqlite_cursor.execute(
        "SELECT id,user_id,pdt_id,quantity FROM cart"
    )

    items=sqlite_cursor.fetchall()

    for item in items:
        psql_cursor.execute("""
            INSERT INTO cart
            (id,user_id,pdt_id,quantity)
            VALUES(%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """,item)

    psql_cursor.execute("""
        SELECT setval(
            'users_id_seq',
            COALESCE((SELECT MAX(id) FROM users),1)
            );
    """)

    psql_cursor.execute("""
        SELECT setval(
        'products_id_seq',
        COALESCE((SELECT MAX(id) FROM products),1)
        );
    """)

    psql_cursor.execute("""
        SELECT setval(
        'cart_id_seq',
        COALESCE((SELECT MAX(id) FROM cart),1)
        );
    """)

    psql_conn.commit()

    print("migration completed")
    print(f"users migrated :{len(users)}")
    print(f"products migrated:{len(products)}")
    print(f"cart items:{len(items)}")

except Exception as e:
    psql_conn.rollback()
    print("error in migration",e)

finally:
    sqlite_cursor.close()
    sqlite_conn.close()
    psql_conn.close()
    psql_cursor.close()

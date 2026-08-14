import os
from dotenv import load_dotenv
load_dotenv()
url = os.getenv("DATABASE_URL")
print(url.split('@')[1] if '@' in url else url)  # shows host/db, hides credentials
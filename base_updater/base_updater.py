import os
import sys
import time
from pathlib import Path
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://sfdaily:sfdaily_pass@database:5432/sfdaily')
UPDATE_DIR = Path('/app/sfdaily_update')
PROCESSED_DIR = Path('/app/sfdaily_processed')

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL)

def execute_sql_file(file_path):
    """Execute SQL file on the database"""
    try:
        conn = get_db_connection()
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        cursor.execute(sql_content)
        cursor.close()
        conn.close()
        
        print(f"✓ Successfully executed {file_path.name}")
        return True
    except Exception as e:
        print(f"✗ Error executing {file_path.name}: {e}")
        return False

def move_to_processed(sql_file):
    """Move SQL file to processed directory and create log"""
    try:
        # Move SQL file
        processed_file = PROCESSED_DIR / sql_file.name
        sql_file.rename(processed_file)
        
        # Create log file
        log_file = PROCESSED_DIR / sql_file.name.replace('.sql', '.log')
        with open(log_file, 'w') as f:
            f.write(f"Processed: {datetime.now().isoformat()}\n")
            f.write(f"File: {sql_file.name}\n")
        
        print(f"✓ Moved {sql_file.name} to processed")
        return True
    except Exception as e:
        print(f"✗ Error moving {sql_file.name}: {e}")
        return False

def check_for_sql_files():
    """Check for new SQL files in update directory"""
    # Debug: Check if directory exists
    if not UPDATE_DIR.exists():
        print(f"✗ Update directory does not exist: {UPDATE_DIR}")
        return
    
    if not UPDATE_DIR.is_dir():
        print(f"✗ Update path is not a directory: {UPDATE_DIR}")
        return
    
    # List all files in directory for debugging
    all_files = list(UPDATE_DIR.glob('*'))
    print(f"🔍 Files in update directory: {len(all_files)}")
    for f in all_files:
        print(f"   - {f.name}")
    
    sql_files = list(UPDATE_DIR.glob('*.sql'))
    print(f"📊 Found {len(sql_files)} SQL file(s)")
    
    if len(sql_files) == 0:
        print("   (No SQL files to process)")
    
    for sql_file in sql_files:
        print(f"\n📄 Processing: {sql_file.name}")
        
        if execute_sql_file(sql_file):
            move_to_processed(sql_file)
        else:
            print(f"⚠ Skipping {sql_file.name} due to error")

def main():
    """Main loop checking for SQL files every 30 minutes"""
    print("🚀 Base Updater Service Started")
    print(f"📁 Update directory: {UPDATE_DIR} (exists: {UPDATE_DIR.exists()})")
    print(f"📁 Processed directory: {PROCESSED_DIR} (exists: {PROCESSED_DIR.exists()})")
    print(f"⏱️  Checking every 30 minutes...")
    print(f"🔄 Waiting for database connection...")
    
    # Wait for database
    max_retries = 30
    for i in range(max_retries):
        try:
            conn = get_db_connection()
            conn.close()
            print("✓ Database connection established")
            break
        except:
            if i == max_retries - 1:
                print("✗ Failed to connect to database after 30 retries")
                sys.exit(1)
            time.sleep(2)
    
    # Initial check
    print("\n📋 Initial check...")
    check_for_sql_files()
    
    # Continuous monitoring
    while True:
        time.sleep(30 * 60)  # 30 minutes
        print(f"\n⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - Checking for updates...")
        check_for_sql_files()

if __name__ == '__main__':
    main()


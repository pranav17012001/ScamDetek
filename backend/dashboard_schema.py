import pandas as pd
import math
import os
import mysql.connector
from dotenv import load_dotenv
from pathlib import Path
import sys
from datetime import datetime

# Load environment variables
load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# Database connection parameters
DB_HOST = os.getenv("DB_HOST", "mysql-2d8a3e22-fit5120-main-project.f.aivencloud.com")
DB_USER = os.getenv("DB_USER", "avnadmin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "AVNS_8cQjqg3qifwF01g7Ra5")
DB_NAME = os.getenv("DB_NAME", "defaultdb")
DB_PORT = int(os.getenv("DB_PORT", "25968"))

# Certificate path
cert_path = os.path.join(os.path.dirname(__file__), "certificates", "ca.pem")


def safe_value(val):
    # Converts NaN to None for SQL NULL
    if pd.isna(val) or (isinstance(val, float) and math.isnan(val)):
        return None
    return val


def get_db_connection():
    """Create a database connection with SSL certificate"""
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT,
            ssl_ca=cert_path,
            ssl_verify_cert=True,
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        sys.exit(1)


def migrate_global_cyber_attacks():
    """Migrate global cyber attacks data from CSV to database"""
    csv_path = "../scamdetek/public/data/cleaned_combined_cyber_data.csv"

    attack_type_descriptions_map = {
        "DDoS": "Attackers overload websites or service so it stops working, which can disrupt access to online banking or government services.",
        "Phishing": "You receive fake emails, messages, or calls pretending to be from trusted sources, trying to trick you into revealing your personal or financial info.",
        "Malware": "Scam messages or fake websites infect your device with malicious software that steals your information or locks your files for ransom.",
        "SQL Injection": "Attackers exploit weak websites to steal or change sensitive information, which can lead to data leaks or financial fraud.",
        "Ransomware": "Your files or device are locked by scammers who demand money to unlock them, often spread through scam emails or links.",
        "Brute Force": "Scammers try every possible password to break into your accounts, which leads to stolen money or personal data.",
        "Cross-site Scripting (XSS)": "Fraudsters insert harmful code into websites, which tricks you into giving away sensitive information or let them steal your data.",
        "Privilege Escalation": "Scammers break into a system and find ways to get even more access by putting more people's data and money at risk.",
        "Zero-Day Exploit": "Scammers use new, unknown software flaws to break into systems before anyone can fix them, making these attacks hard to stop.",
        "Brute Force Attack": "Scammers try every possible password to break into your accounts, which leads to stolen money or personal data.",
        "Man-in-the-Middle": "Scammers secretly listen to your online activity to steal your passwords or financial details.",
    }

    try:
        # Read CSV file
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} rows from {csv_path}")

        # Don't fill NaN values - we'll handle them when inserting to preserve NULLs

        conn = get_db_connection()
        cursor = conn.cursor()

        # Process reference tables first
        # 1. Attack Types
        print("Processing attack types...")
        attack_types = set(df["attack_type"].dropna().unique())
        attack_type_map = {}

        for attack_type in attack_types:
            # Get the description from the map, or use a default if not found
            description = attack_type_descriptions_map.get(
                attack_type, f"No specific description available for {attack_type}."
            )

            cursor.execute(
                """INSERT INTO AttackTypes 
                (attack_name, description) 
                VALUES (%s, %s) ON DUPLICATE KEY UPDATE description=VALUES(description)""",  # Updated to also update description on duplicate
                (attack_type, description),
            )
            cursor.execute(
                "SELECT attack_type_id FROM AttackTypes WHERE attack_name = %s",
                (attack_type,),
            )
            attack_type_map[attack_type] = cursor.fetchone()[0]

        # 2. Industries
        print("Processing industries...")
        industries = set(df["industry"].dropna().unique())
        industry_map = {}

        for industry in industries:
            cursor.execute(
                """INSERT INTO Industries 
                   (industry_name) 
                   VALUES (%s) ON DUPLICATE KEY UPDATE industry_name=industry_name""",
                (industry,),
            )
            cursor.execute(
                "SELECT industry_id FROM Industries WHERE industry_name = %s",
                (industry,),
            )
            industry_map[industry] = cursor.fetchone()[0]

        # 3. Locations
        print("Processing locations...")
        locations = set(df["location"].dropna().unique())
        location_map = {}

        for location in locations:
            cursor.execute(
                """INSERT INTO Locations 
                   (country_name) 
                   VALUES (%s) ON DUPLICATE KEY UPDATE country_name=country_name""",
                (location,),
            )
            cursor.execute(
                "SELECT location_id FROM Locations WHERE country_name = %s", (location,)
            )
            location_map[location] = cursor.fetchone()[0]

        # 4. Severity Levels
        print("Processing severity levels...")
        severities = set(df["attack_severity"].dropna().unique())
        severity_map = {}

        # Add standard severity levels if not in dataset
        standard_severities = ["Low", "Medium", "High", "Critical"]
        for sev in standard_severities:
            if sev not in severities:
                severities.add(sev)

        for severity in severities:
            # Map risk score based on severity
            if severity == "Critical":
                risk_score = 10
            elif severity == "High":
                risk_score = 7
            elif severity == "Medium":
                risk_score = 4
            else:  # Low or any other value
                risk_score = 1
                severity = "Low"  # Ensure we're using a valid enum value

            # Make sure severity is one of the allowed enum values
            if severity not in standard_severities:
                severity = "Low"  # Default to Low if not in the allowed values

            cursor.execute(
                """INSERT INTO SeverityLevels 
                   (severity_name, description, risk_score) 
                   VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE severity_name=severity_name""",
                (severity, f"Description for {severity} severity", risk_score),
            )
            cursor.execute(
                "SELECT severity_id FROM SeverityLevels WHERE severity_name = %s",
                (severity,),
            )
            severity_map[severity] = cursor.fetchone()[0]

        # 5. Now process the main attack data
        print("Processing global cyber attacks data...")

        total_rows = len(df)
        success_count = 0
        error_count = 0

        # Prepare the data
        for index, row in df.iterrows():
            try:
                # Get values and handle NULL/None values properly
                attack_type = safe_value(row["attack_type"])
                industry = safe_value(row["industry"])
                location = safe_value(row["location"])
                severity = safe_value(row["attack_severity"])
                damage = safe_value(row["damage_estimate_usd"])
                outcome = safe_value(row["outcome"])
                target_ip = safe_value(row["target_ip"])

                # Get corresponding IDs - only if not NULL
                attack_type_id = (
                    attack_type_map.get(attack_type)
                    if attack_type is not None
                    else None
                )
                industry_id = (
                    industry_map.get(industry) if industry is not None else None
                )
                location_id = (
                    location_map.get(location) if location is not None else None
                )

                # Severity needs special handling because of ENUM constraints
                if severity is not None:
                    # Validate severity is one of the allowed enum values
                    if severity not in standard_severities:
                        severity = "Low"
                    severity_id = severity_map.get(severity)
                else:
                    # For NULL severity, use Low as a fallback since this is a NOT NULL field
                    severity_id = severity_map.get("Low")

                # Handle date - convert from DD-MM-YYYY to YYYY-MM-DD
                date_str = safe_value(row["date"])
                if date_str is not None:
                    try:
                        # Parse the date from DD-MM-YYYY format
                        date_obj = datetime.strptime(str(date_str), "%d-%m-%Y")
                        attack_date = date_obj.strftime("%Y-%m-%d")
                    except (ValueError, TypeError) as e:
                        print(f"Date parsing error at row {index}: {e}. Using NULL.")
                        attack_date = None
                else:
                    attack_date = None

                # Some fields must have values due to NOT NULL constraints
                # If attack_date is NULL, we'll skip this row
                if attack_date is None:
                    print(f"Skipping row {index}: NULL attack_date not allowed")
                    error_count += 1
                    continue

                # Same for foreign keys that are NOT NULL
                if (
                    attack_type_id is None
                    or industry_id is None
                    or location_id is None
                    or severity_id is None
                ):
                    print(
                        f"Skipping row {index}: NULL value in required foreign key field"
                    )
                    error_count += 1
                    continue

                cursor.execute(
                    """INSERT INTO GlobalCyberAttacks 
                       (attack_date, attack_type_id, industry_id, location_id, severity_id, 
                        damage_estimate_usd, outcome, target_ip, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                    (
                        attack_date,
                        attack_type_id,
                        industry_id,
                        location_id,
                        severity_id,
                        damage,
                        outcome,
                        target_ip,
                    ),
                )
                success_count += 1

                # Print progress every 100 rows
                if (index + 1) % 100 == 0:
                    print(f"Progress: {index + 1}/{total_rows} rows processed")

            except mysql.connector.Error as err:
                print(f"Error inserting row {index}: {err}")
                error_count += 1
                continue
            except Exception as e:
                print(f"Unexpected error at row {index}: {e}")
                error_count += 1
                continue

        conn.commit()
        print(
            f"Migration summary: {success_count} rows imported successfully, {error_count} rows failed"
        )
        print(f"Successfully migrated global cyber attacks data.")

    except Exception as e:
        print(f"Error during migration: {e}")
        if "conn" in locals():
            conn.rollback()
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()


def migrate_malaysia_crimes():
    """Migrate Malaysia online crimes data from CSV to database"""
    csv_path = "../scamdetek/public/data/malaysia_online_crime_dataset.csv"
    try:
        # Read CSV file
        df = pd.read_csv(csv_path)
        print(f"Loaded {len(df)} rows from {csv_path}")

        # Don't fill NaN values - we'll handle them when inserting to preserve NULLs

        conn = get_db_connection()
        cursor = conn.cursor()

        # Process reference tables first

        # 1. Malaysian States
        print("Processing Malaysian states...")
        states = set(df["state"].dropna().unique())
        state_map = {}

        for state in states:
            cursor.execute(
                """INSERT INTO MalaysianStates 
                   (state_name) 
                   VALUES (%s) ON DUPLICATE KEY UPDATE state_name=state_name""",
                (state,),
            )
            cursor.execute(
                "SELECT state_id FROM MalaysianStates WHERE state_name = %s", (state,)
            )
            state_map[state] = cursor.fetchone()[0]

        # 2. Crime Types
        print("Processing crime types...")
        crime_types = set(df["online_crime"].dropna().unique())
        crime_type_map = {}

        for crime_type in crime_types:
            cursor.execute(
                """INSERT INTO CrimeTypes 
                   (crime_name) 
                   VALUES (%s) ON DUPLICATE KEY UPDATE crime_name=crime_name""",
                (crime_type,),
            )
            cursor.execute(
                "SELECT crime_type_id FROM CrimeTypes WHERE crime_name = %s",
                (crime_type,),
            )
            crime_type_map[crime_type] = cursor.fetchone()[0]

        # 3. Age Groups
        print("Processing age groups...")
        age_groups = set(df["age_group"].dropna().unique())
        age_group_map = {}

        for age_group in age_groups:
            cursor.execute(
                "INSERT INTO AgeGroups (age_range) VALUES (%s) ON DUPLICATE KEY UPDATE age_range=age_range",
                (age_group,),
            )
            cursor.execute(
                "SELECT age_group_id FROM AgeGroups WHERE age_range = %s", (age_group,)
            )
            age_group_map[age_group] = cursor.fetchone()[0]

        # 4. Gender Categories
        print("Processing gender categories...")
        genders = set(df["gender"].dropna().unique())
        gender_map = {}

        # Ensure genders match the enum in the schema
        valid_genders = ["male", "female"]

        for gender in genders:
            # Validate gender matches the schema enum
            if gender not in valid_genders:
                continue  # Skip invalid genders

            cursor.execute(
                "INSERT INTO GenderCategories (gender) VALUES (%s) ON DUPLICATE KEY UPDATE gender=gender",
                (gender,),
            )
            cursor.execute(
                "SELECT gender_id FROM GenderCategories WHERE gender = %s", (gender,)
            )
            gender_map[gender] = cursor.fetchone()[0]

        # 5. Now process the main Malaysia online crimes data
        print("Processing Malaysia online crimes data...")

        total_rows = len(df)
        success_count = 0
        error_count = 0

        for index, row in df.iterrows():
            try:
                # Get values with proper NULL handling
                state = safe_value(row["state"])
                crime_type = safe_value(row["online_crime"])
                year_val = safe_value(row["year"])
                year = int(year_val) if year_val is not None else None
                age_group = safe_value(row["age_group"])
                gender = safe_value(row["gender"])

                # Handle numeric values
                number_of_cases_val = safe_value(row["number_of_cases"])
                number_of_cases = (
                    int(number_of_cases_val)
                    if number_of_cases_val is not None
                    else None
                )

                financial_losses_val = safe_value(row["financial_losses_rm"])
                financial_losses = (
                    float(financial_losses_val)
                    if financial_losses_val is not None
                    else None
                )

                number_of_victims_val = safe_value(row["number_of_victims"])
                number_of_victims = (
                    int(number_of_victims_val)
                    if number_of_victims_val is not None
                    else None
                )

                # Check required fields (NOT NULL)
                if state is None or crime_type is None or year is None:
                    print(f"Skipping row {index}: NULL value in required field")
                    error_count += 1
                    continue

                # Get corresponding IDs
                state_id = state_map.get(state)
                crime_type_id = crime_type_map.get(crime_type)

                # Optional foreign keys - can be NULL
                age_group_id = (
                    age_group_map.get(age_group) if age_group is not None else None
                )

                # Gender needs special handling due to ENUM constraints
                if gender is not None:
                    # Validate gender is one of the allowed enum values
                    if gender not in valid_genders:
                        gender_id = None  # Will be stored as NULL
                    else:
                        gender_id = gender_map.get(gender)
                else:
                    gender_id = None

                cursor.execute(
                    """INSERT INTO MalaysianOnlineCrimes 
                       (state_id, year, crime_type_id, number_of_cases, financial_losses_rm, 
                        number_of_victims, age_group_id, gender_id, created_at, updated_at)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                    (
                        state_id,
                        year,
                        crime_type_id,
                        number_of_cases,
                        financial_losses,
                        number_of_victims,
                        age_group_id,
                        gender_id,
                    ),
                )
                success_count += 1

                # Print progress every 100 rows
                if (index + 1) % 100 == 0:
                    print(f"Progress: {index + 1}/{total_rows} rows processed")

            except mysql.connector.Error as err:
                print(f"Error inserting row {index}: {err}")
                error_count += 1
                continue
            except Exception as e:
                print(f"Unexpected error at row {index}: {e}")
                error_count += 1
                continue

        conn.commit()
        print(
            f"Migration summary: {success_count} rows imported successfully, {error_count} rows failed"
        )
        print("Successfully migrated Malaysia online crimes data.")

    except Exception as e:
        print(f"Error during migration: {e}")
        if "conn" in locals():
            conn.rollback()
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals():
            conn.close()


# --- MIGRATION CODE FOR THE THREE CSVs ---
def migrate_malaysia_online_crimes_from_csvs():
    # File paths
    crimes_by_state_csv = (
        "../scamdetek/public/data/table_7_2_online_crimes_by_state.csv"
    )
    victims_by_age_csv = "../scamdetek/public/data/table_7_3_victims_by_age_group.csv"
    victims_by_gender_age_csv = (
        "../scamdetek/public/data/table_7_4_victims_by_gender_and_age.csv"
    )

    # Read CSVs
    df_crimes = pd.read_csv(crimes_by_state_csv)
    df_age = pd.read_csv(victims_by_age_csv)
    df_gender_age = pd.read_csv(victims_by_gender_age_csv)

    conn = get_db_connection()
    cursor = conn.cursor()

    # --- Populate States ---
    all_states = (
        set(df_crimes["state"]).union(df_age["state"]).union(df_gender_age["state"])
    )
    state_map = {}
    for state in all_states:
        cursor.execute(
            "INSERT INTO States (state_name) VALUES (%s) ON DUPLICATE KEY UPDATE state_name=state_name",
            (state,),
        )
        cursor.execute("SELECT state_id FROM States WHERE state_name = %s", (state,))
        state_map[state] = cursor.fetchone()[0]

    # --- Populate OnlineCrimes ---
    all_crimes = (
        set(df_crimes["online_crime"])
        .union(df_age["online_crime"])
        .union(df_gender_age["online_crime"])
    )
    crime_map = {}
    for crime in all_crimes:
        cursor.execute(
            "INSERT INTO OnlineCrimes (crime_name) VALUES (%s) ON DUPLICATE KEY UPDATE crime_name=crime_name",
            (crime,),
        )
        cursor.execute(
            "SELECT crime_id FROM OnlineCrimes WHERE crime_name = %s", (crime,)
        )
        crime_map[crime] = cursor.fetchone()[0]

    # --- Populate AgeGroups ---
    all_ages = set(df_age["age group"]).union(df_gender_age["age group"])
    age_map = {}
    for age in all_ages:
        cursor.execute(
            "INSERT INTO AgeGroups (age_range) VALUES (%s) ON DUPLICATE KEY UPDATE age_range=age_range",
            (age,),
        )
        cursor.execute(
            "SELECT age_group_id FROM AgeGroups WHERE age_range = %s", (age,)
        )
        age_map[age] = cursor.fetchone()[0]

    # --- Populate OnlineCrimesByState ---
    for _, row in df_crimes.iterrows():
        cursor.execute(
            """INSERT INTO OnlineCrimesByState (state_id, year, crime_id, number_of_cases, financial_losses_rm)
            VALUES (%s, %s, %s, %s, %s)""",
            (
                state_map[row["state"]],
                int(row["year"]),
                crime_map[row["online_crime"]],
                (
                    int(row["number_of_cases"])
                    if not pd.isna(row["number_of_cases"])
                    else None
                ),
                (
                    float(row["financial_losses_RM"])
                    if not pd.isna(row["financial_losses_RM"])
                    else None
                ),
            ),
        )

    # --- Populate VictimsByAgeGroup ---
    for _, row in df_age.iterrows():
        cursor.execute(
            """INSERT INTO VictimsByAgeGroup (state_id, year, age_group_id, crime_id, number_of_victims)
            VALUES (%s, %s, %s, %s, %s)""",
            (
                state_map[row["state"]],
                int(row["year"]),
                age_map[row["age group"]],
                crime_map[row["online_crime"]],
                (
                    int(row["number_of_victims"])
                    if not pd.isna(row["number_of_victims"])
                    else None
                ),
            ),
        )

    # --- Populate VictimsByGenderAndAge ---
    for _, row in df_gender_age.iterrows():
        cursor.execute(
            """INSERT INTO VictimsByGenderAndAge (state_id, year, age_group_id, crime_id, gender, number_of_victims)
            VALUES (%s, %s, %s, %s, %s, %s)""",
            (
                state_map[row["state"]],
                int(row["year"]),
                age_map[row["age group"]],
                crime_map[row["online_crime"]],
                row["gender"],
                (
                    int(row["number_of_victims"])
                    if not pd.isna(row["number_of_victims"])
                    else None
                ),
            ),
        )

    conn.commit()
    cursor.close()
    conn.close()


if __name__ == "__main__":

    # --- NEW SCHEMA CREATION ---
    create_tables_script = """
    CREATE TABLE IF NOT EXISTS States (
        state_id INT AUTO_INCREMENT PRIMARY KEY,
        state_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS OnlineCrimes (
        crime_id INT AUTO_INCREMENT PRIMARY KEY,
        crime_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS OnlineCrimesByState (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_id INT NOT NULL,
        year YEAR NOT NULL,
        crime_id INT NOT NULL,
        number_of_cases INT,
        financial_losses_rm DECIMAL(15, 2),
        FOREIGN KEY (state_id) REFERENCES States(state_id),
        FOREIGN KEY (crime_id) REFERENCES OnlineCrimes(crime_id)
    );

    CREATE TABLE IF NOT EXISTS AgeGroups (
        age_group_id INT AUTO_INCREMENT PRIMARY KEY,
        age_range VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS VictimsByAgeGroup (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_id INT NOT NULL,
        year YEAR NOT NULL,
        age_group_id INT NOT NULL,
        crime_id INT NOT NULL,
        number_of_victims INT,
        FOREIGN KEY (state_id) REFERENCES States(state_id),
        FOREIGN KEY (age_group_id) REFERENCES AgeGroups(age_group_id),
        FOREIGN KEY (crime_id) REFERENCES OnlineCrimes(crime_id)
    );

    CREATE TABLE IF NOT EXISTS VictimsByGenderAndAge (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state_id INT NOT NULL,
        year YEAR NOT NULL,
        age_group_id INT NOT NULL,
        crime_id INT NOT NULL,
        gender ENUM('male','female') NOT NULL,
        number_of_victims INT,
        FOREIGN KEY (state_id) REFERENCES States(state_id),
        FOREIGN KEY (age_group_id) REFERENCES AgeGroups(age_group_id),
        FOREIGN KEY (crime_id) REFERENCES OnlineCrimes(crime_id)
    );

    CREATE TABLE IF NOT EXISTS AttackTypes (
        attack_type_id INT AUTO_INCREMENT PRIMARY KEY,
        attack_name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT
    );

    CREATE TABLE IF NOT EXISTS Industries (
        industry_id INT AUTO_INCREMENT PRIMARY KEY,
        industry_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Locations (
        location_id INT AUTO_INCREMENT PRIMARY KEY,
        country_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS SeverityLevels (
        severity_id INT AUTO_INCREMENT PRIMARY KEY,
        severity_name ENUM('Low', 'Medium', 'High', 'Critical') UNIQUE NOT NULL,
        description TEXT,
        risk_score INT
    );

    CREATE TABLE IF NOT EXISTS GlobalCyberAttacks (
        attack_id INT AUTO_INCREMENT PRIMARY KEY,
        attack_date DATE NOT NULL,
        attack_type_id INT NOT NULL,
        industry_id INT NOT NULL,
        location_id INT NOT NULL,
        severity_id INT NOT NULL,
        damage_estimate_usd DECIMAL(15, 2) DEFAULT NULL,
        outcome TEXT,
        target_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (attack_type_id) REFERENCES AttackTypes(attack_type_id),
        FOREIGN KEY (industry_id) REFERENCES Industries(industry_id),
        FOREIGN KEY (location_id) REFERENCES Locations(location_id),
        FOREIGN KEY (severity_id) REFERENCES SeverityLevels(severity_id)
    );

    CREATE TABLE IF NOT EXISTS MalaysianStates (
        state_id INT AUTO_INCREMENT PRIMARY KEY,
        state_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS CrimeTypes (
        crime_type_id INT AUTO_INCREMENT PRIMARY KEY,
        crime_name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS AgeGroups (
        age_group_id INT AUTO_INCREMENT PRIMARY KEY,
        age_range VARCHAR(50) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS GenderCategories (
        gender_id INT AUTO_INCREMENT PRIMARY KEY,
        gender ENUM('Male', 'Female') UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS MalaysianOnlineCrimes (
        crime_id INT AUTO_INCREMENT PRIMARY KEY,
        state_id INT NOT NULL,
        year YEAR NOT NULL,
        crime_type_id INT NOT NULL,
        number_of_cases INT DEFAULT NULL,
        financial_losses_rm DECIMAL(15, 2) DEFAULT NULL,
        number_of_victims INT DEFAULT NULL,
        age_group_id INT DEFAULT NULL,
        gender_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id) REFERENCES MalaysianStates(state_id),
        FOREIGN KEY (crime_type_id) REFERENCES CrimeTypes(crime_type_id),
        FOREIGN KEY (age_group_id) REFERENCES AgeGroups(age_group_id),
        FOREIGN KEY (gender_id) REFERENCES GenderCategories(gender_id)
    );
        """

    conn = get_db_connection()
    cursor = conn.cursor()

    # Execute each SQL statement separately
    for statement in create_tables_script.split(";"):
        if statement.strip():
            cursor.execute(statement)

    conn.commit()
    cursor.close()
    conn.close()

    print("Database tables created successfully.")

    # Run migration functions
    print("Starting data migration process...")
    migrate_global_cyber_attacks()
    migrate_malaysia_online_crimes_from_csvs()

    print("Data migration complete.")

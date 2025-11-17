-- ============================================================================
-- FORCE DELETE ALL TABLES - AGGRESSIVE CLEANUP
-- ============================================================================
-- This script will forcefully delete ALL tables from the database
-- WARNING: This will delete all data permanently!
-- ============================================================================

-- Drop all tables in public schema using PL/pgSQL
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', r.tablename;
    END LOOP;
END $$;

-- Drop all views in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || quote_ident(r.viewname) || ' CASCADE';
        RAISE NOTICE 'Dropped view: %', r.viewname;
    END LOOP;
END $$;

-- Drop all functions in public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args 
              FROM pg_proc p 
              JOIN pg_namespace n ON p.pronamespace = n.oid 
              WHERE n.nspname = 'public') 
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.proname) || '(' || r.args || ') CASCADE';
        RAISE NOTICE 'Dropped function: %', r.proname;
    END LOOP;
END $$;

-- Verify database is completely empty
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as remaining_tables,
    (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') as remaining_views,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public') as remaining_functions;

-- Expected result: 0, 0, 0

-- ============================================================================
-- END OF FORCE DELETE SCRIPT
-- ============================================================================

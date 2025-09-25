# scripts/credits_csv_to_jsonl.py
import csv, json, os, ast, sys

INFILE  = os.path.join(os.getcwd(), "data", "credits.csv")
OUTDIR  = os.path.join(os.getcwd(), "src", "data")
OUTFILE = os.path.join(OUTDIR, "movies.raw.jsonl")

def parse_pylist(cell: str):
    """
    Parse a Python-literal list/dict string safely.
    Handles minor CSV quoting artifacts like doubled quotes.
    """
    if cell is None:
        return []
    s = cell.strip()
    if not s:
        return []
    # Normalize some common CSV-quoting artifacts without damaging content
    # e.g., ... 'name': ""Kelly O'Connell"" ... becomes "Kelly O'Connell"
    s = s.replace('""', '"')
    try:
        val = ast.literal_eval(s)
        if isinstance(val, list):
            return val
        # sometimes it's a string "[]"
        if isinstance(val, str) and val.strip().startswith('['):
            return ast.literal_eval(val)
        return []
    except Exception:
        return []

def first_non_empty(*vals):
    for v in vals:
        if v is not None and str(v).strip() != "":
            return v
    return None

def main():
    if not os.path.exists(INFILE):
        print(f"ERROR: CSV not found at {INFILE}", file=sys.stderr)
        sys.exit(1)
    if os.path.getsize(INFILE) == 0:
        print(f"ERROR: CSV is empty at {INFILE}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUTDIR, exist_ok=True)
    written = 0

    # Try to auto-detect headers: typically 'cast','crew','id' or 'movie_id'
    with open(INFILE, newline="", encoding="utf8", errors="replace") as fin, \
         open(OUTFILE, "w", encoding="utf8") as fout:
        reader = csv.DictReader(fin)
        # header sniff
        headers = [h.lower() for h in reader.fieldnames or []]
        cast_key = next((h for h in reader.fieldnames if h.lower() == "cast"), None)
        crew_key = next((h for h in reader.fieldnames if h.lower() == "crew"), None)
        id_key   = next((h for h in reader.fieldnames if h.lower() in ("id","movie_id","tmdb_id")), None)

        # Fallback if cast/crew not named cleanly: assume first two columns
        if not cast_key or not crew_key:
            if len(reader.fieldnames or []) >= 2:
                cast_key = cast_key or reader.fieldnames[0]
                crew_key = crew_key or reader.fieldnames[1]

        for row in reader:
            raw_cast = row.get(cast_key, "") if cast_key else ""
            raw_crew = row.get(crew_key, "") if crew_key else ""
            movie_id = row.get(id_key) if id_key else None
            if movie_id is None:
                # Try last column if not found
                # Example you showed ends with ,862
                try:
                    movie_id = first_non_empty(*[row.get(k) for k in row.keys() if k not in (cast_key, crew_key)])
                except Exception:
                    movie_id = None

            # Coerce id to int if possible
            try:
                movie_id = int(str(movie_id).strip())
            except Exception:
                movie_id = str(movie_id).strip() if movie_id is not None else None

            cast = parse_pylist(raw_cast)
            crew = parse_pylist(raw_crew)

            # convenience fields for frontend
            cast_names = [c.get("name") for c in cast if isinstance(c, dict) and c.get("name")]
            top_cast = cast_names[:10]

            crew_by_job = {}
            if isinstance(crew, list):
                for c in crew:
                    if isinstance(c, dict):
                        job = c.get("job")
                        name = c.get("name")
                        if job and name:
                            crew_by_job.setdefault(job, []).append(name)

            out_obj = {
                "id": movie_id,
                "cast": cast,            # full objects
                "crew": crew,            # full objects
                "cast_names": cast_names,
                "top_cast": top_cast,
                "crew_by_job": crew_by_job
            }

            fout.write(json.dumps(out_obj, ensure_ascii=False) + "\n")
            written += 1

    print(f"Wrote {written} lines → {OUTFILE}")

if __name__ == "__main__":
    main()

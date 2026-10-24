import asyncio
from datetime import date, datetime, timedelta, timezone

from lib.dates import today_iso
from lib.db import db, ensure_indexes
from lib.security import TZ, hash_secret, new_id

GROUP_NAME = "3°B Liceo"
GROUP_PASSWORD = "1234"
MEMBERS = [("Giulia", "1234"), ("Marco", "1111"), ("Sara", "2222"), ("Luca", "3333"), ("Elena", "4444")]


def ts(hours_ago: float) -> str:
    return (datetime.now(timezone.utc) - timedelta(hours=hours_ago)).isoformat()


async def main() -> None:
    await ensure_indexes()
    old = await db.groups.find_one({"name_key": GROUP_NAME.casefold()})
    if old:
        gid = old["id"]
        member_ids = [m["id"] for m in await db.members.find({"group_id": gid}).to_list(1000)]
        poll_ids = [p["id"] for p in await db.polls.find({"group_id": gid}).to_list(1000)]
        await db.sessions.delete_many({"member_id": {"$in": member_ids}})
        await db.poll_votes.delete_many({"poll_id": {"$in": poll_ids}})
        for coll in ("members", "homework", "polls", "folders", "materials", "files", "notices", "point_events", "purchases"):
            await db[coll].delete_many({"group_id": gid})
        await db.groups.delete_one({"id": gid})

    gid = new_id()
    await db.groups.insert_one(
        {"id": gid, "name": GROUP_NAME, "name_key": GROUP_NAME.casefold(), "password_hash": hash_secret(GROUP_PASSWORD), "created_at": ts(24 * 30)}
    )
    members = {}
    for i, (nick, pin) in enumerate(MEMBERS):
        m = {"id": new_id(), "group_id": gid, "nickname": nick, "nickname_key": nick.casefold(), "pin_hash": hash_secret(pin), "joined_at": ts(24 * 30 - i), "role": "admin" if i == 0 else "member", "participating": False}
        members[nick] = m
        await db.members.insert_one(m)

    today = date.fromisoformat(today_iso(TZ))
    d = lambda n: (today + timedelta(days=n)).isoformat()  # noqa: E731
    homework = [
        ("Matematica", d(1), "Esercizi sulle derivate: pag. 214 n. 12-25 (solo dispari).", "alta", "Giulia", False, None),
        ("Storia", d(3), "Saggio breve sul primo dopoguerra in Italia (max 2 colonne di foglio protocollo).", "media", "Marco", False, None),
        ("Fisica", d(5), "Relazione di laboratorio sui circuiti in serie e in parallelo, con grafici.", "media", "Sara", False, None),
        ("Inglese", d(2), "Leggere il capitolo 3 di 'Dubliners' e preparare un riassunto orale.", "bassa", "Luca", False, None),
        ("Italiano", d(0), "Analisi del testo: 'La pioggia nel pineto' — parafrasi e figure retoriche.", "alta", "Elena", False, None),
        ("Latino", d(-1), "Versione di Cicerone n. 48 del libro di esercizi.", "media", "Giulia", True, "Marco"),
    ]
    for i, (subj, due, desc, prio, author, done, by) in enumerate(homework):
        await db.homework.insert_one(
            {"id": new_id(), "group_id": gid, "subject": subj, "due_date": due, "description": desc, "priority": prio, "author": author,
             "completed": done, "completed_by": by, "completed_at": ts(5) if done else None, "created_at": ts(48 - i)}
        )

    polls = [
        ("Turni interrogazione di Storia: quando preferisci essere interrogato?", False, "Marco",
         ["Lunedì 1° turno", "Mercoledì 2° turno", "Venerdì 3° turno"], {"Giulia": 0, "Sara": 1, "Luca": 0}),
        ("Tema della maglietta di classe per la gita", True, "Sara",
         ["Minimal con logo della scuola", "Citazione latina", "Caricature dei prof"], {"Marco": 2, "Elena": 1, "Luca": 2, "Sara": 0}),
    ]
    for i, (q, anon, author, opts, votes) in enumerate(polls):
        options = [{"id": new_id(), "text": t} for t in opts]
        pid = new_id()
        await db.polls.insert_one({"id": pid, "group_id": gid, "question": q, "anonymous": anon, "options": options, "author": author, "created_at": ts(30 - i * 10)})
        for nick, idx in votes.items():
            await db.poll_votes.insert_one({"poll_id": pid, "member_id": members[nick]["id"], "nickname": nick, "option_id": options[idx]["id"], "created_at": ts(3)})

    folders = {}
    for i, (name, by) in enumerate([("Matematica", "Giulia"), ("Storia", "Marco"), ("Schemi & Formulari", "Sara")]):
        fid = new_id()
        folders[name] = fid
        await db.folders.insert_one({"id": fid, "group_id": gid, "name": name, "name_key": name.casefold(), "created_by": by, "created_at": ts(24 * 20 - i)})
    materials = [
        ("Matematica", "Dispensa derivate (Drive)", "link", "https://drive.google.com/", "Teoria + 40 esercizi svolti.", "Giulia"),
        ("Matematica", "Regole di derivazione da ricordare", "note", None, "D[x^n] = n·x^(n-1)\nD[sin x] = cos x\nD[e^x] = e^x\nD[ln x] = 1/x\nProdotto: f'g + fg'", "Luca"),
        ("Storia", "Video: il Biennio Rosso", "link", "https://www.youtube.com/", None, "Marco"),
        ("Storia", "Mappa del primo dopoguerra", "note", None, "1919 Trattati di Parigi → vittoria mutilata\n1919-20 Biennio Rosso\n1921 nascita PCd'I\n1922 Marcia su Roma", "Elena"),
        ("Schemi & Formulari", "Formulario di Fisica — elettricità", "link", "https://drive.google.com/", "Legge di Ohm, resistenze in serie/parallelo.", "Sara"),
    ]
    for i, (folder, title, kind, url, note, author) in enumerate(materials):
        await db.materials.insert_one(
            {"id": new_id(), "group_id": gid, "folder_id": folders[folder], "title": title, "kind": kind, "url": url, "note": note, "author": author, "created_at": ts(20 - i)}
        )

    notices = [
        ("Cambio aula da lunedì", "Da lunedì le lezioni di Scienze si terranno nel laboratorio 2 al primo piano.", "avviso", "Giulia", 2),
        ("Raccolta quote gita a Firenze", "Entro venerdì portate 85€ a Sara (rappresentante). Ricordatevi anche l'autorizzazione firmata!", "urgente", "Sara", 8),
        ("Assemblea d'istituto", "Giovedì alle 11:00 in aula magna. Ordine del giorno: progetti di fine anno.", "info", "Marco", 26),
    ]
    for title, body, tag, author, h in notices:
        await db.notices.insert_one({"id": new_id(), "group_id": gid, "title": title, "body": body, "tag": tag, "author": author, "created_at": ts(h)})

    print(f"Seeded '{GROUP_NAME}' (password {GROUP_PASSWORD}).")


if __name__ == "__main__":
    asyncio.run(main())

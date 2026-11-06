import random

RARITIES = ["comune", "non_comune", "raro", "epico", "leggendario", "mitico"]

BUCKET_LIMIT = 30

_rng = random.SystemRandom()

_RAW = [
    ("pesce_rosso", "Pesce rosso", "comune", "fusi", "#F97316", "#FDBA74", "#EA580C", "scales", 8, 20, 1, "Un classico arancione che nuota in tondo senza fretta."),
    ("gambusia", "Gambusia", "comune", "fusi", "#A8A29E", "#D6D3D1", "#78716C", "none", 3, 7, 1, "Minuscola e vivace, ripulisce lo stagno dalle zanzare."),
    ("alborella", "Alborella", "comune", "lungo", "#CBD5E1", "#F1F5F9", "#94A3B8", "lateral", 8, 15, 2, "Argentea e velocissima, vive sempre in branco."),
    ("triotto", "Triotto", "comune", "fusi", "#9CA3AF", "#E5E7EB", "#EF4444", "lateral", 8, 18, 2, "Ha il fianco brillante e le pinne rossicce."),
    ("scardola", "Scardola", "comune", "tondo", "#B8A06A", "#E8D9A8", "#DC2626", "scales", 12, 30, 2, "Tondeggiante, con l'occhio rosso e le pinne vivaci."),
    ("rutilo", "Rutilo", "comune", "fusi", "#94A3B8", "#E2E8F0", "#F87171", "scales", 10, 25, 2, "Predilige le acque calme e i fondali erbosi."),
    ("cobite", "Cobite", "comune", "anguilla", "#A16207", "#FDE68A", "#713F12", "spots", 8, 15, 3, "Sottile e maculato, ama il fondo fangoso."),
    ("persico_sole", "Persico sole", "comune", "tondo", "#22C55E", "#FBBF24", "#F97316", "spots", 8, 20, 2, "Piccolo e colorato, sembra un gioiello vivente."),
    ("ghiozzo", "Ghiozzo", "comune", "siluro", "#78716C", "#D6D3D1", "#57534E", "spots", 6, 14, 3, "Si nasconde tra i sassi e aspetta in agguato."),
    ("avannotto", "Avannotto argentato", "comune", "fusi", "#E2E8F0", "#FFFFFF", "#CBD5E1", "none", 3, 6, 1, "Così piccolo che quasi non si vede."),
    ("latterino", "Latterino", "comune", "lungo", "#BAE6FD", "#F0F9FF", "#7DD3FC", "lateral", 5, 10, 1, "Trasparente e luccicante, salta fuori dall'acqua."),
    ("rovella", "Rovella", "comune", "fusi", "#A3A3A3", "#E5E5E5", "#F59E0B", "stripes", 7, 14, 2, "Una striscia scura le attraversa il fianco."),
    ("carpa", "Carpa", "non_comune", "tondo", "#84A059", "#E7D9A0", "#6B7C3F", "scales", 30, 70, 4, "Robusta e curiosa, passa ore a rovistare sul fondo."),
    ("tinca", "Tinca", "non_comune", "tondo", "#4D7C0F", "#A3B87C", "#3F6212", "none", 25, 50, 4, "Verde oliva, scivolosa e dalle scaglie minuscole."),
    ("cavedano", "Cavedano", "non_comune", "fusi", "#8C8C7A", "#E5E7EB", "#EF4444", "scales", 25, 50, 3, "Mangia di tutto e abbocca con decisione."),
    ("persico_reale", "Persico reale", "non_comune", "fusi", "#65A30D", "#FDE68A", "#DC2626", "stripes", 18, 40, 4, "Strisce verticali e una pinna dorsale spinosa."),
    ("barbo", "Barbo", "non_comune", "lungo", "#A39266", "#E7E5E4", "#78716C", "spots", 25, 55, 4, "Ama la corrente e frugare tra i ciottoli."),
    ("pesce_gatto", "Pesce gatto", "non_comune", "siluro", "#57534E", "#A8A29E", "#44403C", "none", 25, 60, 4, "Con i suoi baffi sente tutto ciò che si muove."),
    ("gardon", "Gardon", "non_comune", "fusi", "#CBD5E1", "#F8FAFC", "#F97316", "scales", 15, 30, 3, "Argenteo, con le pinne arancioni."),
    ("savetta", "Savetta", "non_comune", "lungo", "#94A3B8", "#E2E8F0", "#64748B", "lateral", 25, 45, 4, "Sottile e rapida, sfreccia a pelo d'acqua."),
    ("carpa_specchio", "Carpa a specchio", "non_comune", "tondo", "#92846A", "#F5E6C4", "#6B5B3E", "scales", 35, 75, 5, "Le sue grandi scaglie riflettono la luce."),
    ("luccio", "Luccio", "raro", "lungo", "#3F6212", "#D9F99D", "#A3E635", "spots", 50, 110, 6, "Un predatore silenzioso che attacca all'improvviso."),
    ("trota_fario", "Trota fario", "raro", "fusi", "#A16207", "#FDE68A", "#DC2626", "spots", 25, 50, 6, "Puntini rossi e acque limpide: non si accontenta."),
    ("trota_iridea", "Trota iridea", "raro", "fusi", "#94A3B8", "#F8FAFC", "#F472B6", "lateral", 30, 60, 6, "Una banda rosata lungo il fianco brilla come un arcobaleno."),
    ("anguilla", "Anguilla", "raro", "anguilla", "#365314", "#D9F99D", "#1A2E05", "none", 40, 100, 6, "Scivola via da ogni presa, viene da lontano."),
    ("lucioperca", "Lucioperca", "raro", "lungo", "#64748B", "#E2E8F0", "#334155", "stripes", 45, 90, 6, "Occhi chiari per cacciare nell'acqua torbida."),
    ("black_bass", "Black bass", "raro", "fusi", "#3F6212", "#D9F99D", "#14532D", "lateral", 25, 55, 6, "Combatte con salti e strattoni fino all'ultimo."),
    ("carpa_koi", "Carpa koi", "raro", "tondo", "#F8FAFC", "#FDA4AF", "#EF4444", "patches", 40, 80, 7, "Macchie rosse su fondo bianco, simbolo di fortuna."),
    ("salmerino", "Salmerino", "raro", "fusi", "#0F766E", "#FDBA74", "#FB923C", "spots", 25, 55, 6, "Ventre arancione e un amore per l'acqua fredda."),
    ("storione", "Storione", "epico", "lungo", "#475569", "#CBD5E1", "#1E293B", "scales", 80, 180, 8, "Un gigante preistorico dal dorso corazzato."),
    ("siluro", "Siluro", "epico", "siluro", "#1E293B", "#64748B", "#0F172A", "none", 90, 200, 8, "Il re del fondale: enorme, scuro e paziente."),
    ("koi_showa", "Koi Showa", "epico", "tondo", "#0F172A", "#F8FAFC", "#EF4444", "patches", 45, 85, 7, "Nero, rosso e bianco: una vera opera d'arte."),
    ("pesce_lanterna", "Pesce lanterna", "epico", "fusi", "#1E3A8A", "#38BDF8", "#22D3EE", "glow", 15, 35, 7, "Brilla nel buio per attirare le prede."),
    ("pesce_corallo", "Pesce corallo", "epico", "piatto", "#F43F5E", "#FDE68A", "#FB923C", "stripes", 12, 30, 7, "Colori da barriera in mezzo a uno stagno."),
    ("pesce_ghiaccio", "Pesce ghiaccio", "epico", "fusi", "#BAE6FD", "#F0F9FF", "#7DD3FC", "scales", 20, 45, 7, "Le sue scaglie sembrano cristalli."),
    ("carpa_imperiale", "Carpa imperiale", "leggendario", "tondo", "#FBBF24", "#FEF3C7", "#F59E0B", "scales", 60, 110, 9, "Si dice che porti fortuna a chi la pesca."),
    ("luccio_spettrale", "Luccio spettrale", "leggendario", "lungo", "#A5F3FC", "#ECFEFF", "#67E8F9", "glow", 80, 150, 9, "Appare nelle notti di nebbia e poi svanisce."),
    ("pesce_stellato", "Pesce stellato", "leggendario", "piatto", "#312E81", "#A5B4FC", "#FDE047", "stars", 30, 60, 9, "Porta sul dorso un frammento di cielo notturno."),
    ("drago_pond", "Drago del Pond", "mitico", "drago", "#10B981", "#FDE68A", "#F43F5E", "scales", 150, 300, 10, "La creatura che custodisce lo stagno da secoli."),
    ("pesce_lunare", "Pesce lunare", "mitico", "piatto", "#E0E7FF", "#FFFFFF", "#C4B5FD", "glow", 70, 140, 10, "Emerge solo quando la luna si specchia nell'acqua."),
]

SPECIES: list[dict] = [
    {
        "id": r[0],
        "name": r[1],
        "rarity": r[2],
        "shape": r[3],
        "colors": [r[4], r[5], r[6]],
        "pattern": r[7],
        "min": r[8],
        "max": r[9],
        "difficulty": r[10],
        "description": r[11],
    }
    for r in _RAW
]

SPECIES_BY_ID: dict[str, dict] = {s["id"]: s for s in SPECIES}

BY_RARITY: dict[str, list[dict]] = {r: [s for s in SPECIES if s["rarity"] == r] for r in RARITIES}

BAITS: list[dict] = [
    {
        "id": "pane",
        "name": "Pane",
        "description": "Attira in fretta, soprattutto pesci comuni.",
        "wait": (6, 16),
        "odds": {"comune": 70, "non_comune": 22, "raro": 6, "epico": 1.6, "leggendario": 0.35, "mitico": 0.05},
    },
    {
        "id": "verme",
        "name": "Verme",
        "description": "Equilibrato: va bene per quasi tutti.",
        "wait": (10, 22),
        "odds": {"comune": 52, "non_comune": 28, "raro": 14, "epico": 4.5, "leggendario": 1.2, "mitico": 0.3},
    },
    {
        "id": "mosca",
        "name": "Mosca finta",
        "description": "Più lenta ma cerca prede di valore.",
        "wait": (14, 28),
        "odds": {"comune": 30, "non_comune": 30, "raro": 24, "epico": 11, "leggendario": 4, "mitico": 1},
    },
    {
        "id": "brillante",
        "name": "Esca luccicante",
        "description": "Richiede molta pazienza ma può svegliare le leggende.",
        "wait": (20, 40),
        "odds": {"comune": 14, "non_comune": 22, "raro": 28, "epico": 22, "leggendario": 10, "mitico": 4},
    },
]

BAITS_BY_ID: dict[str, dict] = {b["id"]: b for b in BAITS}


def pick_fish(bait: dict) -> tuple[dict, float]:
    rarity = _rng.choices(RARITIES, weights=[bait["odds"][r] for r in RARITIES])[0]
    species = _rng.choice(BY_RARITY[rarity])
    span = species["max"] - species["min"]
    length = round(_rng.triangular(species["min"], species["max"], species["min"] + span * 0.3), 1)
    return species, length


def bite_delay(bait: dict) -> float:
    low, high = bait["wait"]
    return round(_rng.uniform(low, high), 1)


def fight_profile(species: dict, length: float) -> dict:
    span = max(species["max"] - species["min"], 1)
    strength = round(min(1.0, max(0.0, (length - species["min"]) / span)), 2)
    dash = round(min(1.0, 0.15 + species["difficulty"] * 0.08 + strength * 0.2), 2)
    window = round(min(3.0, max(1.6, 3.2 - species["difficulty"] * 0.15)), 1)
    return {"strength": strength, "dash": dash, "bite_window": window}

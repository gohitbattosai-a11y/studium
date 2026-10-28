# Aggiungere immagini profilo, sfondi e pet con gli SVG

Disegni e animi un file SVG fuori dal codice, lo metti in una cartella, aggiungi una riga nel catalog e il sito lo mostra da solo. Nessun disegno va scritto negli script.

## In breve

1. Crea l'SVG e salvalo con l'id che vuoi come nome del file.
2. Mettilo nella cartella giusta:
   - `frontend/src/assets/art/decorations/<id>.svg` per le immagini profilo
   - `frontend/src/assets/art/backgrounds/<id>.svg` per gli sfondi
   - `frontend/src/assets/art/pets/<id>.svg` per i pet
3. Aggiungi la voce in `backend/lib/custom_catalog.json` con lo stesso id.
4. Riavvia il backend (il JSON si legge all'avvio). Il frontend in sviluppo si aggiorna da solo.

L'id usa solo minuscole, cifre, `-` e `_` (esempio: `anello-blu`).

## custom_catalog.json

```json
{
  "items": [
    {"id": "anello-blu", "kind": "decoration", "name": "Anello blu", "description": "Un anello che orbita.", "price": 50, "window": null},
    {"id": "notte-stellata", "kind": "background", "name": "Notte stellata", "description": "Stelle che lampeggiano.", "price": 60, "window": ["12-20", "01-06"]}
  ],
  "pets": [
    {"id": "blob", "name": "Blob", "rarity": "raro"}
  ]
}
```

- `kind` vale `decoration` (immagine profilo) o `background` (sfondo).
- `window` è `null` per un oggetto sempre acquistabile, oppure `["MM-GG", "MM-GG"]` per un oggetto a tempo (esempio sopra: dal 20 dicembre al 6 gennaio).
- `rarity` dei pet: `comune`, `non_comune`, `raro`, `epico`, `leggendario`, `mitico`. Un pet nuovo entra automaticamente nelle box.
- Le voci con id non valido o già esistente vengono saltate e il motivo finisce nel log del backend.
- Se un SVG ha lo stesso id di un disegno già presente nel codice, vince l'SVG: così puoi sostituire anche i vecchi.

## Dimensioni (viewBox)

| Tipo | viewBox | Note |
| --- | --- | --- |
| Immagine profilo | `0 0 100 100` | L'avatar occupa il cerchio centrale di raggio 25. Disegna attorno, fino al bordo |
| Sfondo | `0 0 1600 900` | Riempie lo schermo e viene ritagliato se le proporzioni cambiano |
| Pet | `0 0 100 80` | Disegnalo rivolto verso destra, con i piedi vicino a y = 70 |

## Animare con il CSS

Le animazioni si scrivono in CSS dentro un tag `<style>` nell'SVG. Non usare quelle SMIL (`<animate>`, `<animateTransform>`): girano sempre e il sito non riesce a metterle in pausa.

Il sito ferma le animazioni di anteprime e immagini profilo finché non passi con il mouse sopra; con il CSS questo funziona da solo.

Regola importante: per far ruotare o scalare un elemento sul suo centro servono `transform-box: fill-box` e `transform-origin: center`.

Ricette da copiare:

```css
.ruota { transform-box: fill-box; transform-origin: center; animation: giro 8s linear infinite; }
@keyframes giro { to { transform: rotate(360deg); } }

.pulsa { transform-box: fill-box; transform-origin: center; animation: pulsa 1.6s ease-in-out infinite alternate; }
@keyframes pulsa { from { transform: scale(0.8); opacity: 0.6; } to { transform: scale(1.15); opacity: 1; } }

.fluttua { animation: fluttua 4s ease-in-out infinite alternate; }
@keyframes fluttua { from { transform: translateY(0); } to { transform: translateY(-6px); } }

.lampeggia { animation: lampeggia 3s ease-in-out infinite; }
@keyframes lampeggia { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
```

Per sfalsare più elementi con la stessa animazione usa `animation-delay` negativo (esempio: `-1s`, `-2s`).

Id, classi e nomi dei keyframes vengono isolati per file in automatico, quindi puoi chiamarli come vuoi senza scontri tra file diversi. Funzionano sia le classi (`.ruota`) sia gli id (`#orbita`).

### Classi pronte

- Immagini profilo: `dc-spin`, `dc-spin-slow`, `dc-spin-rev`, `dc-spin-fast`, `dc-flame`, `dc-flicker`, `dc-twinkle`. Si usano come `class="dc-spin-slow"` su un gruppo, senza scrivere CSS.
- Pet: dai ai gruppi le classi `pt-body`, `pt-tail`, `pt-ear`, `pt-wing`, `pt-eye` e ottieni gratis respiro da fermo, camminata, salto e sonno. `pt-leg-a` e `pt-leg-b` fanno oscillare le zampe (due gruppi che si alternano).

## Strumenti gratuiti

Figma gratuito esporta l'SVG, ma non fa animazioni esportabili e il codice CSS è nel Dev Mode a pagamento. Non ti serve: disegna lì e anima a parte.

1. Figma (gratis) solo per il disegno
   - Crea un frame con le dimensioni della tabella sopra, ad esempio 100 × 100.
   - Dai un nome ai gruppi che vuoi animare (`orbita`, `ala`, `occhio`).
   - Seleziona il frame, apri Export, scegli SVG e spunta "Include id attribute". I nomi dei layer diventano gli id.
   - Evita sfocature, ombre e immagini incorporate: pesano e rallentano.
2. Inkscape (gratis, desktop) se vuoi lavorare direttamente in SVG
   - L'id di un oggetto si cambia da Oggetto > Proprietà oggetto (Ctrl+Maiusc+O).
   - Salva come "SVG semplice" (Plain SVG).
3. Penpot (gratis, open source, nel browser)
   - Disegna ed esporta in SVG come in Figma.
4. Tool di animazione online (esempio SVGator)
   - I piani gratuiti hanno limiti sull'esportazione. Se esporta animazioni SMIL, non vanno in pausa col sito: meglio far convertire il risultato in CSS.

### Il modo più comodo: farti scrivere il CSS da Claude

1. Esporta l'SVG statico dal tool che preferisci.
2. Incollalo in chat e scrivi cosa deve muoversi (esempio: "il gruppo `orbita` ruota lento, le stelle lampeggiano a ritmi diversi, la coda del pet scodinzola").
3. Claude ti restituisce l'SVG con il blocco `<style>` già dentro.
4. Salvalo nella cartella giusta e aggiungi la riga nel catalog.

## Esempi pronti

In `frontend/art-examples` ci sono tre file funzionanti da copiare e modificare: `decorations/esempio-anello.svg`, `backgrounds/esempio-notte.svg`, `pets/esempio-blob.svg`.

## Se qualcosa non funziona

- Non compare nello shop: controlla la voce nel catalog (id uguale al nome del file, JSON valido) e riavvia il backend. Gli errori sono nel log.
- Compare nello shop ma senza disegno: il nome del file non coincide con l'id, oppure l'SVG non inizia con `<svg`.
- L'elemento non ruota sul suo centro: mancano `transform-box: fill-box` e `transform-origin: center`.
- Non si anima: l'animazione è SMIL. Riscrivila in CSS.
- Immagine profilo troppo piccola o fuori misura: ricontrolla che il viewBox sia `0 0 100 100` e che l'avatar occupi solo il cerchio centrale.

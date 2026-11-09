import type { Block, Lesson } from "./lessons";

type Part = { title: string; text?: string; blocks: Block[] };

const make = (id: string, title: string, summary: string, parts: Part[]): Lesson => ({
  id,
  subject: "italiano",
  title,
  summary,
  blocks: parts.flatMap((p) => [{ t: "section" as const, title: p.title, text: p.text }, ...p.blocks]),
});

const fonologia = make(
  "ita-fonologia",
  "I suoni della nostra lingua: la fonologia",
  "Fonemi, coppie minime, lettere e suoni, vocali aperte e chiuse, doppie, sillabe e accento: il piano terra della grammatica.",
  [
    {
      title: "La lingua è un palazzo",
      text: "Prima di studiare i suoni, capiamo dove si trovano.",
      blocks: [
        { t: "p", text: "Pensa a un palazzo. Al piano terra ci sono i mattoni; con i mattoni si costruiscono le stanze, con le stanze gli appartamenti, con gli appartamenti l'intero edificio. La lingua funziona allo stesso modo: le parti più piccole si uniscono per formarne di più grandi. La grammatica studia ciascuno di questi piani, uno alla volta." },
        {
          t: "steps",
          title: "Sali i piani del palazzo: premi «Avanti»",
          items: [
            { title: "Piano terra · Fonologia", text: "Studia i suoni della lingua, i «mattoni»: c · a · n · e. Da qui parte tutto, ed è da qui che parte questo capitolo." },
            { title: "Primo piano · Morfologia", text: "Studia come sono fatte le parole: gatt-o, gatt-i. La parte che resta uguale e la parte finale che cambia." },
            { title: "Secondo piano · Sintassi della frase", text: "Studia come si uniscono le parole in una frase: Luca legge un libro." },
            { title: "Terzo piano · Sintassi del periodo", text: "Studia come si uniscono più frasi tra loro: Ti chiamo quando arrivo." },
          ],
        },
        {
          t: "sort",
          title: "A quale piano appartiene?",
          buckets: ["Fonologia", "Morfologia", "Sintassi della frase", "Sintassi del periodo"],
          items: [
            { text: "c · a · n · e", bucket: 0, why: "Sono singoli suoni: siamo al piano terra." },
            { text: "gatt-o · gatt-i", bucket: 1, why: "Si studia come cambia la parte finale della parola: morfologia." },
            { text: "Luca legge un libro.", bucket: 2, why: "Una frase sola, con le sue parole che si uniscono." },
            { text: "Ti chiamo quando arrivo.", bucket: 3, why: "Due frasi unite tra loro: sintassi del periodo." },
          ],
        },
      ],
    },
    {
      title: "Il fonema: un suono che cambia una parola",
      text: "Perché pane e cane sono parole diverse.",
      blocks: [
        { t: "p", text: "Prova a pronunciare pane e cane. Le due parole sono quasi uguali: cambia soltanto il primo suono. Eppure il significato è del tutto diverso: una cosa si mangia, l'altra abbaia. Un suono che, se lo cambiamo, fa cambiare il significato di una parola si chiama fonema. La parte della grammatica che studia i fonemi si chiama fonologia." },
        { t: "p", text: "Due parole che si distinguono per un solo suono formano una coppia minima. Le coppie minime sono il «test» dei linguisti: se cambiando un solo suono nasce un'altra parola, allora quel suono è un fonema." },
        {
          t: "flip",
          title: "Tre coppie minime: tocca per vedere che cosa cambia",
          cards: [
            { front: "pane / cane", back: "Cambia il primo suono: p / c. Una cosa si mangia, l'altra abbaia." },
            { front: "vino / vano", back: "Cambia la vocale in mezzo: i / a. Anche una vocale è un fonema." },
            { front: "caro / carro", back: "Cambia la lunghezza della consonante: r / rr. Anche una doppia può cambiare il significato." },
          ],
        },
        { t: "note", title: "Da ricordare", text: "Il fonema è il suono più piccolo che cambia il significato di una parola. Una coppia minima è formata da due parole che si distinguono per un solo suono." },
        { t: "quiz", question: "Quale di queste è una coppia minima?", options: ["sole / luna", "rana / lana", "casa / cassetta", "pane / panetteria"], answer: 1, why: "Rana e lana si distinguono per un solo suono, il primo: r / l. Nelle altre coppie cambiano più suoni o la lunghezza della parola." },
        { t: "reveal", prompt: "Se cambio un solo suono in «pollo» posso ottenere «bollo». Quale fonema è cambiato, e che cosa ci dimostra?", answer: "È cambiato il primo suono, p / b. Ci dimostra che p e b sono due fonemi diversi: se così non fosse, pollo e bollo sarebbero la stessa parola." },
      ],
    },
    {
      title: "Lettere e suoni non coincidono",
      text: "21 lettere, circa 30 suoni: i conti non tornano, e ci sono i trucchi.",
      blocks: [
        { t: "p", text: "Le lettere si vedono: le scriviamo e le leggiamo. I suoni si sentono: li pronunciamo e li ascoltiamo. L'alfabeto italiano ha 21 lettere, ma i suoni della nostra lingua sono circa 30. Le lettere sono meno dei suoni: per questo alcune lettere devono fare più di un lavoro, e a volte ne servono due o tre per scrivere un solo suono." },
        {
          t: "flip",
          title: "Tre trucchi della scrittura: tocca le carte",
          cards: [
            { front: "Una lettera, due suoni", back: "La C è dura in cane e dolce in cena. La G è dura in gatto e dolce in gelato. La S è sorda in sole e sonora in sbaglio: con la mano sulla gola, nella S sonora senti vibrare le corde vocali." },
            { front: "Due o tre lettere, un solo suono", back: "Due lettere formano un digramma (gn di gnomo, sc di scena, ch di chiave, gh di ghiro); tre lettere formano un trigramma (gli di figli, sci di sciarpa)." },
            { front: "Una lettera muta", back: "La H non si pronuncia mai. Serve a distinguere parole uguali (ho e o, hanno e anno) oppure a rendere dure la C e la G davanti a E e I (che, ghiro)." },
          ],
        },
        { t: "formula", text: "GNOMO  →  5 lettere, 4 suoni", caption: "GN è un solo suono: g-n-o-m-o si legge /gn/ + o + m + o" },
        { t: "note", title: "La regola di C e G", text: "C e G sono dure davanti ad A, O, U e dolci davanti a E e I. Per avere il suono duro davanti a E e I serve una H: che, chi, ghe, ghi." },
        {
          t: "sort",
          title: "C e G: suono duro o dolce?",
          hint: "Attenzione: conta il suono, non la lettera che segue.",
          buckets: ["Suono duro", "Suono dolce"],
          items: [
            { text: "cena", bucket: 1, why: "C davanti a E: dolce." },
            { text: "casa", bucket: 0, why: "C davanti ad A: dura." },
            { text: "gioco", bucket: 1, why: "G davanti a I: dolce." },
            { text: "gatto", bucket: 0, why: "G davanti ad A: dura." },
            { text: "cielo", bucket: 1, why: "C davanti a I: dolce." },
            { text: "ghiro", bucket: 0, why: "La H indurisce la G davanti a I." },
            { text: "chiodo", bucket: 0, why: "La H indurisce la C davanti a I." },
            { text: "giallo", bucket: 1, why: "G davanti a I: dolce." },
            { text: "cuore", bucket: 0, why: "C davanti a U: dura." },
            { text: "gelato", bucket: 1, why: "G davanti a E: dolce." },
          ],
        },
        {
          t: "fill",
          title: "Conta i suoni",
          hint: "Ricorda: digrammi e trigrammi contano come un suono solo, la H non conta.",
          items: [
            { before: "«casa» ha 4 lettere e", after: ".", options: ["3 suoni", "4 suoni", "5 suoni"], answer: 1, why: "Nessuna lettera è muta o doppia: 4 lettere, 4 suoni." },
            { before: "«chiave» ha 6 lettere e", after: ".", options: ["4 suoni", "5 suoni", "6 suoni"], answer: 1, why: "CH è un solo suono: ch + i + a + v + e = 5 suoni." },
            { before: "«sciarpa» ha 7 lettere e", after: ".", options: ["5 suoni", "6 suoni", "7 suoni"], answer: 0, why: "SCI è un trigramma, un solo suono: sci + a + r + p + a = 5 suoni." },
            { before: "«ghiro» ha 5 lettere e", after: ".", options: ["3 suoni", "4 suoni", "5 suoni"], answer: 1, why: "GH è un digramma: gh + i + r + o = 4 suoni." },
            { before: "«hotel» ha 5 lettere e", after: ".", options: ["3 suoni", "4 suoni", "5 suoni"], answer: 1, why: "La H non corrisponde a nessun suono: o + t + e + l = 4 suoni." },
          ],
        },
      ],
    },
    {
      title: "Vocali e consonanti",
      text: "Cinque lettere, sette suoni. E le doppie che cambiano tutto.",
      blocks: [
        { t: "h", text: "Le vocali" },
        { t: "p", text: "Le lettere vocali sono cinque: A, E, I, O, U. I suoni vocalici, però, sono sette, perché la E e la O possono essere aperte (è, ò) oppure chiuse (é, ó). Anche questa differenza può cambiare il significato." },
        {
          t: "flip",
          title: "Aperta o chiusa? Tocca le coppie",
          cards: [
            { front: "pèsca / pésca", back: "Con la e aperta è il frutto; con la e chiusa è lo sport (la pesca dei pesci)." },
            { front: "bòtte / bótte", back: "Con la o aperta sono i colpi; con la o chiusa è il barile." },
            { front: "vènti / vénti", back: "Con la e aperta sono i venti che soffiano; con la e chiusa è il numero 20." },
          ],
        },
        { t: "note", title: "Lo sapevi?", text: "La pronuncia di riferimento dell'italiano è quella di Firenze, ma in molte zone d'Italia, Veneto compreso, le vocali aperte e chiuse si distribuiscono in modo diverso. Non sono errori: sono italiani regionali. Nella lingua scritta, invece, le parole sono uguali per tutti." },
        { t: "h", text: "Le consonanti e le doppie" },
        { t: "p", text: "Le consonanti sono i suoni che si pronunciano incontrando un ostacolo: le labbra, i denti, la lingua. In italiano possono essere semplici o doppie. Le doppie si pronunciano più lunghe e, ancora una volta, cambiano il significato: pala (per scavare) e palla (per giocare), nono (il numero) e nonno (il parente), sete (voglia di bere) e sette (il numero)." },
        { t: "note", title: "Attenzione al Nord", text: "Nel Nord Italia le doppie spesso si pronunciano più deboli e si sentono poco: per questo è facile dimenticarle quando si scrive. Nel dubbio, pronuncia la parola lentamente o controlla sul dizionario." },
        {
          t: "fill",
          title: "Singola o doppia?",
          items: [
            { before: "Mio", after: "ha ottant'anni.", options: ["nono", "nonno"], answer: 1, why: "Il parente è il nonno, con la doppia." },
            { before: "Oggi è il", after: "giorno di scuola.", options: ["nono", "nonno"], answer: 0, why: "Il numero ordinale è nono, con la n semplice." },
            { before: "Dopo la corsa ho molta", after: ".", options: ["sete", "sette"], answer: 0, why: "La voglia di bere è sete." },
            { before: "Mia sorella ha", after: "anni.", options: ["sete", "sette"], answer: 1, why: "Il numero è sette, con la doppia." },
            { before: "Il giardiniere scava con la", after: ".", options: ["pala", "palla"], answer: 0, why: "Per scavare serve la pala." },
            { before: "Il contadino guida il", after: ".", options: ["caro", "carro"], answer: 1, why: "Il veicolo trainato è il carro, con la doppia." },
          ],
        },
      ],
    },
    {
      title: "La sillaba",
      text: "Come dividere una parola, e perché serve per andare a capo.",
      blocks: [
        { t: "p", text: "Quando pronunciamo una parola lentamente, la dividiamo in pezzi: ma-ti-ta, qua-der-no. Ogni pezzo si chiama sillaba ed è un gruppo di suoni pronunciato con una sola emissione di voce. Ogni sillaba contiene sempre almeno una vocale. Conoscere le sillabe serve anche per andare a capo correttamente." },
        {
          t: "steps",
          title: "Le regole principali, una alla volta",
          items: [
            { title: "Le doppie si dividono", text: "pal-la, cam-mi-no: una consonante resta con la sillaba prima, l'altra va con la sillaba dopo." },
            { title: "Restano unite le consonanti che possono stare all'inizio di una parola", text: "fi-ne-stra (esiste «strada»), ca-pra (esiste «prato»)." },
            { title: "L, M, N, R seguite da un'altra consonante si separano", text: "al-be-ro, cam-po, par-te." },
            { title: "Dittongo: due vocali pronunciate insieme non si dividono", text: "pie-de, buo-no: la i e la u sono deboli e si appoggiano alla vocale vicina." },
            { title: "Iato: due vocali pronunciate separatamente si dividono", text: "pa-u-ra: ogni vocale ha il suo battito." },
          ],
        },
        {
          t: "fill",
          title: "Dividi in sillabe",
          items: [
            { before: "cammino →", after: "", options: ["cam-mi-no", "ca-mmi-no", "camm-i-no"], answer: 0, why: "Le doppie si dividono." },
            { before: "finestra →", after: "", options: ["fi-ne-stra", "fin-e-stra", "fines-tra"], answer: 0, why: "«str» può stare all'inizio di parola (strada): resta unito." },
            { before: "albero →", after: "", options: ["al-be-ro", "a-lbe-ro", "alb-e-ro"], answer: 0, why: "La L seguita da un'altra consonante si separa." },
            { before: "capra →", after: "", options: ["ca-pra", "cap-ra", "c-a-pra"], answer: 0, why: "«pr» può stare all'inizio di parola (prato): resta unito." },
          ],
        },
        {
          t: "sort",
          title: "Dittongo o iato?",
          buckets: ["Dittongo", "Iato"],
          items: [
            { text: "piede", bucket: 0, why: "pie-de: la i debole si appoggia alla e." },
            { text: "paura", bucket: 1, why: "pa-u-ra: a e u si pronunciano separate." },
            { text: "buono", bucket: 0, why: "buo-no: la u debole si appoggia alla o." },
            { text: "maestro", bucket: 1, why: "ma-e-stro: a ed e sono due vocali forti, non possono stare insieme." },
            { text: "cielo", bucket: 0, why: "cie-lo: dittongo ie." },
            { text: "faina", bucket: 1, why: "fa-i-na: la i è accentata nella pronuncia, quindi si separa." },
          ],
        },
      ],
    },
    {
      title: "L'accento e l'intonazione",
      text: "La sillaba che pronunciamo con più forza, e il tono della voce.",
      blocks: [
        { t: "p", text: "In ogni parola c'è una sillaba che pronunciamo con più forza: è la sillaba accentata (o tonica). A seconda della sua posizione, le parole si dividono in tronche (accento sull'ultima sillaba: città, caffè, perché), piane (sulla penultima: casa, scuola, libro) e sdrucciole (sulla terzultima: tavolo, lampada). Le piane sono le più numerose." },
        { t: "note", title: "Quando si scrive l'accento", text: "L'accento si scrive sempre sulle parole tronche di due o più sillabe (città, perché) e su alcune parole di una sola sillaba (è, là, sì, più). Nelle altre parole la voce lo sente, ma sulla carta non si segna." },
        {
          t: "sort",
          title: "Tronca, piana o sdrucciola?",
          hint: "Pronuncia la parola ad alta voce: dove cade la voce forte?",
          buckets: ["Tronca", "Piana", "Sdrucciola"],
          items: [
            { text: "città", bucket: 0, why: "Accento sull'ultima sillaba: cit-TÀ." },
            { text: "tavolo", bucket: 2, why: "Accento sulla terzultima: TÀ-vo-lo." },
            { text: "scuola", bucket: 1, why: "Accento sulla penultima: SCUO-la." },
            { text: "caffè", bucket: 0, why: "Accento sull'ultima: caf-FÈ." },
            { text: "telefono", bucket: 2, why: "Accento sulla terzultima: te-LE-fo-no." },
            { text: "libro", bucket: 1, why: "Accento sulla penultima: LI-bro." },
            { text: "perché", bucket: 0, why: "Accento sull'ultima: per-CHÉ." },
            { text: "lampada", bucket: 2, why: "Accento sulla terzultima: LAM-pa-da." },
          ],
        },
        {
          t: "flip",
          title: "L'accento può cambiare la parola",
          cards: [
            { front: "àncora / ancóra", back: "àncora è quella della nave; ancóra vuol dire «di nuovo»." },
            { front: "prìncipi / princìpi", back: "prìncipi sono i figli del re; princìpi sono i valori." },
            { front: "càpitano / capitàno", back: "càpitano vuol dire «succedono»; capitàno è il comandante." },
          ],
        },
        { t: "h", text: "L'intonazione: anche la voce parla" },
        { t: "p", text: "Leggi ad alta voce queste tre frasi: Piove. Piove? Piove! Le parole e i suoni sono gli stessi, ma il tono della voce cambia: nella prima dai un'informazione, nella seconda fai una domanda, nella terza esprimi stupore. Questo andamento della voce si chiama intonazione. Nello scritto la rappresentiamo con la punteggiatura: il punto, il punto interrogativo, il punto esclamativo." },
        {
          t: "fill",
          title: "Che tono ha?",
          items: [
            { before: "«Piove?» esprime", after: ".", options: ["un'informazione", "una domanda", "stupore"], answer: 1, why: "Il punto interrogativo segnala la salita della voce di una domanda." },
            { before: "«Piove!» esprime", after: ".", options: ["un'informazione", "una domanda", "stupore"], answer: 2, why: "Il punto esclamativo segnala stupore, gioia, rabbia." },
            { before: "«Piove.» esprime", after: ".", options: ["un'informazione", "una domanda", "stupore"], answer: 0, why: "Il punto fermo segnala un'affermazione neutra." },
          ],
        },
        { t: "quiz", question: "Perché le vocali sono cinque lettere ma sette suoni?", options: ["Perché la E e la O possono essere aperte o chiuse", "Perché la I e la U contano doppio", "Perché la H è una vocale", "Perché ci sono le doppie"], answer: 0, why: "Le due vocali E e O hanno ciascuna due suoni (aperto e chiuso): 5 + 2 = 7." },
        { t: "quiz", question: "Quale affermazione sulla lettera H è corretta?", options: ["Si pronuncia sempre con un soffio", "Non corrisponde a nessun suono", "È una vocale", "Si usa solo nelle parole straniere"], answer: 1, why: "La H è muta: serve a distinguere parole (ho / o) e a indurire C e G (che, ghiro)." },
        { t: "reveal", prompt: "Riassumi in tre frasi il capitolo: che cosa studia la fonologia e perché lettere e suoni non coincidono?", answer: "La fonologia studia i suoni della lingua, e il fonema è il suono più piccolo che cambia il significato (pane / cane). Le lettere sono 21 e i suoni circa 30, quindi una lettera può valere due suoni (C, G, S) e più lettere possono formare un suono solo (gn, sc, gli). Inoltre doppie e accento cambiano il significato, e la voce mette il tono che nello scritto diventa punteggiatura." },
      ],
    },
  ],
);

const mito = make(
  "ita-mito",
  "Il mito: raccontare le origini",
  "Che cos'è un mito, da dove nasce, come è fatto, come si distingue da leggenda, fiaba e favola e perché tutti i popoli ne hanno raccontati.",
  [
    {
      title: "Che cos'è un mito",
      text: "Una verità raccontata, non dimostrata.",
      blocks: [
        { t: "p", text: "Un mito è un racconto che una comunità considera vero e importante, e che spiega come sono nate le cose: il mondo, gli dèi, gli uomini, la morte, le stagioni, i nomi dei luoghi. La parola viene dal greco mŷthos, che significa semplicemente «parola, racconto»." },
        {
          t: "flip",
          title: "Due modi di dire il vero",
          cards: [
            { front: "mŷthos", back: "La parola che racconta. Il mito dice il vero raccontando una storia." },
            { front: "lógos", back: "La parola ragionata e argomentata. Il lógos dice il vero dimostrandolo." },
          ],
        },
        { t: "note", title: "Attenzione al significato di oggi", text: "Oggi «mito» significa spesso «favola, cosa non vera». Per chi lo raccontava non era così: il mito era la spiegazione, non una bugia ma la verità disponibile prima che esistesse la scienza." },
        { t: "quiz", question: "Che cosa distingue il mŷthos dal lógos per i Greci?", options: ["Il mito è falso, il lógos è vero", "Il mito racconta il vero, il lógos lo dimostra", "Il mito è scritto, il lógos è orale", "Non c'è nessuna differenza"], answer: 1, why: "Sono due modi diversi di dire il vero: il mito lo racconta, il lógos lo dimostra." },
      ],
    },
    {
      title: "Da dove nasce il mito",
      text: "Prima della scrittura c'era la voce. E tre bisogni.",
      blocks: [
        { t: "p", text: "Il mito nasce prima della scrittura, dalla voce. Per secoli è stato trasmesso oralmente, di generazione in generazione, da cantori e anziani. Solo molto dopo qualcuno lo ha messo per iscritto. Nasce da tre bisogni profondi." },
        {
          t: "steps",
          title: "I tre bisogni: premi «Avanti»",
          items: [
            { title: "Spiegare", text: "L'uomo antico osservava fenomeni potenti e incomprensibili, come il fulmine, il terremoto, il sole che sparisce ogni sera, e li spiegava con la volontà di esseri superiori. Il fulmine non è elettricità: è l'arma di Zeus." },
            { title: "Dare un fondamento", text: "Il mito giustifica l'ordine esistente: perché comandano i re, perché si fanno certi sacrifici, perché quella città porta quel nome. Racconta il passato per legittimare il presente." },
            { title: "Dare un senso", text: "Perché si soffre? Perché si muore? Perché esiste il male? Il mito non elimina queste domande: le rende sopportabili trasformandole in storia." },
          ],
        },
        {
          t: "sort",
          title: "Quale bisogno soddisfa?",
          buckets: ["Spiegare", "Dare un fondamento", "Dare un senso"],
          items: [
            { text: "Il fulmine è l'arma di Zeus", bucket: 0, why: "Spiega un fenomeno naturale che non si capiva." },
            { text: "Perché quella città porta quel nome", bucket: 1, why: "Giustifica un dato del presente con una storia del passato." },
            { text: "Perché esiste il male?", bucket: 2, why: "È una domanda sul senso della vita." },
            { text: "Perché il sole sparisce ogni sera", bucket: 0, why: "Fenomeno naturale da spiegare." },
            { text: "Perché comandano i re", bucket: 1, why: "Legittima l'ordine esistente." },
            { text: "Perché si muore?", bucket: 2, why: "Rende sopportabile una domanda senza risposta." },
          ],
        },
      ],
    },
    {
      title: "Le caratteristiche e i sei tipi di mito",
      text: "Come riconoscere un mito, e come classificarlo.",
      blocks: [
        {
          t: "flip",
          title: "Le sette caratteristiche: tocca le carte",
          cards: [
            { front: "1 · Orale e anonimo", back: "Non ha un autore: ha una comunità. Nessuno «inventa» un mito, tutti lo ereditano." },
            { front: "2 · Collettivo", back: "Appartiene a un popolo intero e ne esprime i valori, le paure, la religione." },
            { front: "3 · Nel tempo delle origini", back: "Non un tempo storico databile, ma un «prima» assoluto in cui tutto poteva ancora cambiare." },
            { front: "4 · Protagonisti straordinari", back: "Dèi, semidèi, eroi, mostri: esseri più grandi dell'uomo comune." },
            { front: "5 · Variabile", back: "Esiste in molte versioni: cambia da luogo a luogo e da autore ad autore. Non c'è un testo ufficiale." },
            { front: "6 · Sacro", back: "È legato al culto, ai riti, alle feste. Si raccontava nei templi e durante le celebrazioni." },
            { front: "7 · Simbolico", back: "Dice una cosa per dirne un'altra: la lotta di Zeus contro i Titani racconta il passaggio dal disordine all'ordine." },
          ],
        },
        {
          t: "flip",
          title: "I sei tipi di mito: dall'etimologia al significato",
          cards: [
            { front: "Cosmogonico (kósmos + gonía)", back: "Racconta la nascita dell'universo. Esempio: il Caos di Esiodo." },
            { front: "Teogonico (theós, dio)", back: "Racconta l'origine degli dèi. Esempio: le tre generazioni divine." },
            { front: "Antropogonico (ánthropos, uomo)", back: "Racconta l'origine dell'uomo. Esempio: Prometeo e Pandora." },
            { front: "Eziologico (aitía, causa)", back: "Spiega la causa di un fenomeno o di un nome. Esempio: Aracne e il ragno." },
            { front: "Eroico (hérōs, eroe)", back: "Racconta le imprese di un eroe. Esempio: Eracle, Teseo, Perseo." },
            { front: "Escatologico (éschatos, ultimo)", back: "Racconta la fine del mondo. Esempio: il Ragnarök." },
          ],
        },
        {
          t: "sort",
          title: "Di che tipo di mito si tratta?",
          hint: "Qualche mito potrebbe stare in due categorie: scegli quella che spiega meglio il nucleo del racconto.",
          buckets: ["Cosmogonico", "Teogonico", "Antropogonico", "Eziologico", "Eroico", "Escatologico"],
          items: [
            { text: "Demetra cerca la figlia rapita e la terra smette di dare frutti", bucket: 3, why: "Spiega la causa delle stagioni: è eziologico." },
            { text: "Gli dèi impastano l'uomo con il mais", bucket: 2, why: "Racconta l'origine dell'uomo (Popol Vuh)." },
            { text: "Eracle strangola il leone di Nemea", bucket: 4, why: "Un'impresa di un eroe." },
            { text: "Dal corpo del gigante Ymir nascono la terra e il cielo", bucket: 0, why: "Racconta la nascita del mondo." },
            { text: "Il lupo Fenrir divora Odino", bucket: 5, why: "Fa parte del Ragnarök, la fine del mondo." },
            { text: "Zeus detronizza Crono", bucket: 1, why: "Racconta la successione delle generazioni divine." },
          ],
        },
      ],
    },
    {
      title: "Il mito nel mondo",
      text: "Popoli lontanissimi, stesse storie.",
      blocks: [
        { t: "p", text: "Tutti i popoli, in ogni epoca e continente, hanno prodotto miti: è uno degli elementi più universali della cultura umana. Gira le carte per fare il giro del mondo." },
        {
          t: "flip",
          title: "Otto civiltà, otto nuclei",
          cards: [
            { front: "Mesopotamia · Enūma eliš, Gilgameš", back: "Il mondo nasce dal corpo della dea Tiamat; un eroe cerca l'immortalità e la perde." },
            { front: "Egitto · Testi delle Piramidi", back: "Il dio Atum emerge dalle acque primordiali; Osiride ucciso e risorto." },
            { front: "Ebraismo · Genesi", back: "Un Dio unico crea con la parola: «Sia la luce»." },
            { front: "India · Rigveda, Mahābhārata", back: "Il mondo nasce dal sacrificio del gigante Purusha." },
            { front: "Nord Europa · Edda", back: "Il mondo nasce dal gigante Ymir e finirà nel Ragnarök." },
            { front: "Maya · Popol Vuh", back: "Gli dèi creano l'uomo dal mais dopo vari tentativi falliti." },
            { front: "Oceania · tradizione maori", back: "Cielo e Terra, abbracciati, vengono separati dai figli." },
            { front: "Africa occidentale · yoruba", back: "Obatala scende dal cielo e plasma la terra dall'acqua." },
          ],
        },
        {
          t: "steps",
          title: "Le cinque somiglianze: ritornano sempre",
          items: [
            { title: "Il caos iniziale", text: "Prima c'è sempre il disordine, il buio, l'acqua indistinta." },
            { title: "La separazione", text: "Creare significa dividere: cielo da terra, luce da tenebra, acqua da terra." },
            { title: "Il diluvio", text: "Un'inondazione distrugge l'umanità e pochi si salvano: in Mesopotamia, nella Bibbia, in Grecia, in America, in Australia." },
            { title: "La colpa originaria", text: "L'uomo perde una condizione felice a causa di una trasgressione." },
            { title: "L'eroe fondatore", text: "Qualcuno porta agli uomini un dono decisivo: il fuoco, il grano, le leggi." },
          ],
        },
        { t: "reveal", prompt: "Perché popoli che non si sono mai incontrati raccontano miti simili? Prova a formulare tre ipotesi.", answer: "Tre ipotesi: (1) la memoria di catastrofi realmente avvenute, come inondazioni; (2) i contatti e gli scambi fra popoli, che hanno fatto viaggiare i racconti; (3) il fatto che la mente umana, ovunque, si pone le stesse domande e trova immagini simili per rispondere." },
        { t: "quiz", question: "Quale di questi nuclei NON compare tra le somiglianze dei miti del mondo?", options: ["Il caos iniziale", "Il diluvio", "L'eroe fondatore", "Il trionfo della tecnologia"], answer: 3, why: "Le cinque somiglianze sono caos, separazione, diluvio, colpa originaria ed eroe fondatore." },
      ],
    },
    {
      title: "Il mito greco",
      text: "Dèi molto umani e un mondo strappato al caos.",
      blocks: [
        { t: "p", text: "Il mito greco è quello che conosciamo meglio, perché i Greci lo hanno messo per iscritto presto ed è diventato il patrimonio comune della cultura europea: lo ritroviamo in Dante, Botticelli, Shakespeare, Mozart, nei nomi dei pianeti e nel linguaggio di tutti i giorni (un tallone d'Achille, un lavoro titanico, un narcisista, il panico, l'eco)." },
        { t: "h", text: "Un mondo pieno di dèi, molto umani" },
        { t: "p", text: "Per i Greci il divino era ovunque: in ogni fiume una ninfa, in ogni bosco un dio. La religione greca è politeista (molti dèi), antropomorfa (gli dèi hanno forma e corpo umani) e senza dogmi: non c'è una bibbia greca, non c'è un'ortodossia. Gli dèi sono immortali, bellissimi e potentissimi, ma si comportano come uomini: litigano, mentono, si innamorano, sono gelosi, si vendicano. La differenza fra dèi e uomini non è dunque morale, ma di potenza e soprattutto di durata: gli dèi non muoiono." },
        {
          t: "seq",
          title: "Le tre generazioni divine",
          hint: "Il mondo greco nasce attraverso una successione violenta. Rimetti in ordine gli eventi.",
          items: [
            "Dal Caos nascono Gaia (la Terra), Urano (il Cielo) ed Eros",
            "Urano ostacola i figli e il figlio Crono lo evira con una falce",
            "Crono divora i propri figli per non essere spodestato",
            "Zeus, salvato dalla madre Rea, sconfigge Crono nella Titanomachia e instaura l'ordine olimpico",
          ],
          why: "Il messaggio è chiaro: l'ordine del mondo è una conquista, strappata al caos e alla violenza.",
        },
        { t: "h", text: "L'uomo di fronte agli dèi" },
        {
          t: "flip",
          title: "Due parole chiave del mito greco",
          cards: [
            { front: "hýbris", back: "La tracotanza: superare la misura, voler essere come un dio." },
            { front: "némesis", back: "La punizione inevitabile che segue la hýbris. Chi sfida gli dèi perde sempre: Aracne, Niobe, Icaro, Fetonte. Il mito greco insegna la misura umana." },
          ],
        },
        {
          t: "flip",
          title: "Chi ci ha tramandato questi racconti",
          cards: [
            { front: "Omero · VIII sec. a.C.", back: "Iliade e Odissea: gli dèi in azione accanto agli uomini." },
            { front: "Esiodo · VIII-VII sec. a.C.", back: "Teogonia (la nascita degli dèi) e Opere e giorni (Prometeo, Pandora, le età dell'uomo)." },
            { front: "I tragici · V sec. a.C.", back: "Eschilo, Sofocle, Euripide rileggono i miti per interrogare l'uomo." },
            { front: "Ovidio · 43 a.C. - 17 d.C.", back: "Latino: le Metamorfosi sono la grande raccolta che ha trasmesso il mito greco a tutta l'arte europea." },
          ],
        },
        { t: "quiz", question: "Che cosa significa che la religione greca è «antropomorfa»?", options: ["Ha un solo dio", "Gli dèi hanno forma e corpo umani", "È rivolta solo agli uomini", "Ha una bibbia"], answer: 1, why: "Antropomorfa vuol dire «di forma umana»: gli dèi greci hanno corpo umano e passioni umane." },
        { t: "quiz", question: "Quale coppia descrive meglio la sfida di Aracne ad Atena?", options: ["Hýbris e némesis", "Caos e Gaia", "Zeus e Crono", "Mŷthos e lógos"], answer: 0, why: "Aracne supera la misura (hýbris) e viene punita (némesis)." },
      ],
    },
    {
      title: "La forma del mito",
      text: "Nato per essere ascoltato, non letto.",
      blocks: [
        { t: "p", text: "Il mito nasce per essere ascoltato, non letto, e questo ne determina la forma. Ogni caratteristica serve a due scopi: aiutare chi racconta a ricordare e aiutare chi ascolta a orientarsi." },
        {
          t: "flip",
          title: "Gli attrezzi del cantore: tocca le carte",
          cards: [
            { front: "Il verso", back: "L'epica greca usa l'esametro dattilico, un verso lungo e regolare che aiuta la memoria e dà solennità." },
            { front: "Le formule", back: "Espressioni fisse che ritornano identiche: Achille piè veloce, l'Aurora dalle dita di rosa, il mare colore del vino. Servivano al cantore per improvvisare e all'ascoltatore per riconoscere." },
            { front: "Le ripetizioni", back: "Scene tipiche (il banchetto, la vestizione dell'eroe, il sacrificio) tornano quasi uguali: chi ascolta si orienta." },
            { front: "Il linguaggio", back: "Alto, solenne, ricco di epiteti, similitudini e immagini concrete. Il mito non spiega concetti astratti: li mostra in forma di persona. La Discordia non è un'idea, è una dea che getta una mela." },
            { front: "Il finale eziologico", back: "Molti miti si chiudono con una formula del tipo «ed è per questo che ancora oggi…»: il racconto si aggancia al mondo reale di chi ascolta." },
            { front: "La metamorfosi", back: "Trasformazione di un essere in un altro (pianta, animale, pietra, stella). Il personaggio non muore: resta nel mondo sotto altra forma e diventa la spiegazione visibile di qualcosa." },
          ],
        },
        {
          t: "seq",
          title: "La struttura tipica di un mito",
          items: [
            "Equilibrio iniziale",
            "Trasgressione o conflitto",
            "Intervento divino",
            "Punizione o trasformazione",
            "Nuovo ordine definitivo",
          ],
          why: "Questa struttura ricorre in moltissimi miti: osservala nei tre esempi qui sotto.",
        },
        { t: "h", text: "Tre miti da leggere con la lente" },
        {
          t: "steps",
          title: "Aracne (Ovidio, Metamorfosi): premi «Avanti»",
          items: [
            { title: "Situazione iniziale", text: "Aracne, tessitrice lidia di umili origini, è così brava da affermare di non avere nulla da imparare da Atena." },
            { title: "Hýbris", text: "La dea la sfida. Atena tesse un arazzo che raffigura la punizione dei mortali superbi; Aracne ne tesse uno che raffigura gli amori vergognosi degli dèi." },
            { title: "Némesis", text: "L'opera di Aracne è perfetta, Atena non vi trova un difetto, e proprio per questo, furiosa, la colpisce con la spola. Aracne, travolta dalla vergogna, cerca la morte." },
            { title: "Metamorfosi", text: "La dea la trattiene in vita trasformandola in ragno, condannata a tessere per sempre." },
            { title: "Spiegazione del mondo presente", text: "Ecco perché il ragno tesse. Notiamo una durezza tipicamente greca: Aracne è punita non perché ha sbagliato, ma perché era troppo brava." },
          ],
        },
        {
          t: "steps",
          title: "Prometeo e Pandora (Esiodo): tre spiegazioni in un racconto",
          items: [
            { title: "Il fuoco", text: "Prometeo, il Titano «che pensa prima», ama gli uomini: inganna Zeus nella spartizione dei sacrifici e poi ruba il fuoco agli dèi, nascondendolo in una canna. Spiega perché l'uomo possiede il fuoco, cioè la civiltà." },
            { title: "La punizione", text: "Zeus incatena Prometeo a una rupe, dove un'aquila gli divora il fegato, che ricresce ogni notte." },
            { title: "Pandora e il vaso", text: "Agli uomini Zeus invia Pandora, la prima donna, «il bel male»: apre il vaso e ne escono malattie, fatica, vecchiaia, dolore. Spiega perché la vita è faticosa. Sul fondo resta solo la Speranza: spiega perché, nonostante tutto, continuiamo a sperare." },
          ],
        },
        {
          t: "steps",
          title: "Il Ragnarök (Edda): dove anche gli dèi muoiono",
          items: [
            { title: "La fine", text: "Dopo tre inverni senza estate, i lupi divorano il sole e la luna, la terra trema, il serpente Jörmungandr emerge dall'oceano. Dèi e mostri si affrontano e si uccidono a vicenda: Odino è divorato dal lupo Fenrir, Thor uccide il serpente e muore del suo veleno." },
            { title: "Il nuovo inizio", text: "Il mondo brucia e sprofonda nel mare. Poi la terra riemerge verde, due esseri umani sopravvissuti escono da un bosco e tutto ricomincia." },
          ],
        },
        { t: "reveal", prompt: "Perché nel Ragnarök gli dèi muoiono, mentre per un Greco sarebbe impensabile?", answer: "Perché ogni cultura costruisce i propri dèi a propria immagine: i Greci immaginarono dèi immortali, i popoli del Nord immaginarono divinità mortali come loro." },
        { t: "reveal", prompt: "In Esiodo il mondo nasce dal Caos (Cháos, «voragine, apertura»). In Genesi un Dio crea con la parola. Che differenza c'è?", answer: "In Esiodo non c'è un creatore: il mondo non è fatto da qualcuno, nasce, come una pianta o un parto, e il primo elemento non è la materia ma il vuoto. Nella Genesi un Dio esterno crea attraverso la parola. Sono due idee opposte dell'origine." },
      ],
    },
    {
      title: "Mito, leggenda, fiaba, favola",
      text: "Quattro racconti che si confondono. Quattro domande per distinguerli.",
      blocks: [
        { t: "p", text: "Sono tutti racconti brevi di tradizione popolare, spesso con elementi fantastici, e per questo si confondono continuamente. Ma rispondono a bisogni diversi e si distinguono con quattro domande." },
        { t: "formula", text: "Chi sono i protagonisti?  ·  Quando e dove si svolge?\nA che cosa serve il racconto?  ·  Ci si credeva?", caption: "le quattro domande" },
        {
          t: "flip",
          title: "I quattro racconti: tocca le carte",
          cards: [
            { front: "Il mito", back: "Racconto sacro delle origini. Protagonisti: dèi, titani, eroi, mostri. Tempo delle origini, prima della storia. Serve a spiegare e fondare. Era creduto vero ed era legato al culto. Esempi: Prometeo, Aracne, il ratto di Persefone." },
            { front: "La leggenda", back: "Nasce da un fatto o da un luogo reale e lo amplifica con elementi fantastici. Protagonisti: uomini realmente esistiti o creduti tali (santi, re, briganti). Tempo e luogo precisi. Dà identità a una comunità. Era creduta vera, ma di una verità storica. Esempi: Romolo e Remo, re Artù, Guglielmo Tell, Robin Hood." },
            { front: "La fiaba", back: "Racconto fantastico di puro intrattenimento. Protagonisti senza nome proprio (il figlio minore, Cenerentola) aiutati da esseri magici. Tempo e luogo indeterminati: «c'era una volta, in un regno lontano». Accompagna la crescita. Nessuno la crede vera. Finale quasi sempre lieto." },
            { front: "La favola", back: "Racconto brevissimo e didattico. Protagonisti: animali che parlano e rappresentano un vizio o una virtù (la volpe l'astuzia, il lupo la prepotenza). Serve a insegnare e si chiude con una morale esplicita. Non è creduta vera. Esempi: La volpe e l'uva, Il lupo e l'agnello." },
          ],
        },
        {
          t: "sort",
          title: "Mito, leggenda, fiaba o favola?",
          hint: "Per ognuno, trova il criterio che decide: protagonisti, tempo e luogo, scopo, credibilità.",
          buckets: ["Mito", "Leggenda", "Fiaba", "Favola"],
          items: [
            { text: "Un corvo con un pezzo di formaggio nel becco si lascia lusingare da una volpe e lo perde", bucket: 3, why: "Animali che rappresentano un vizio (la vanità): favola." },
            { text: "Zeus incatena Prometeo a una rupe del Caucaso", bucket: 0, why: "Protagonisti divini, tempo delle origini, spiega la civiltà: mito." },
            { text: "Un giovane arciere svizzero deve colpire una mela sulla testa del figlio", bucket: 1, why: "Uomo creduto realmente esistito, luogo preciso: leggenda." },
            { text: "Il terzo figlio di un mugnaio eredita solo un gatto, che però parla", bucket: 2, why: "Protagonista con nome-etichetta, aiutante magico, tempo indeterminato: fiaba." },
            { text: "Dalle ceneri di un serpente ucciso nasce la sorgente che ancora oggi alimenta il paese", bucket: 1, why: "Ancorata a un luogo reale e alla sua identità: leggenda." },
            { text: "Atena trasforma Aracne in ragno", bucket: 0, why: "Dea, metamorfosi, finale eziologico: mito." },
          ],
        },
        { t: "h", text: "I confronti a due a due" },
        {
          t: "flip",
          title: "Quali coppie si confondono di più?",
          cards: [
            { front: "Mito ↔ leggenda", back: "Entrambi erano creduti veri: è la somiglianza più forte. Cambia il tipo di verità e il tempo: il mito parla del tempo delle origini e riguarda il sacro; la leggenda parla della storia e riguarda una comunità precisa. Prova: Zeus non è mai esistito in un luogo e in una data; Guglielmo Tell, secondo chi lo raccontava, sì." },
            { front: "Mito ↔ favola", back: "Entrambi «insegnano», ma in modo opposto. Il mito mostra e lascia interpretare: nessuno, alla fine di Aracne, scrive «non bisogna essere superbi». La favola dichiara la lezione in una riga finale. Inoltre il mito è sacro e collettivo; la favola è laica e spesso ha un autore (Esopo, Fedro)." },
            { front: "Mito ↔ fiaba", back: "Hanno molti motivi in comune (la prova, il mostro, l'aiutante magico), tanto che si è ipotizzato che la fiaba sia un mito che ha perso il sacro. Differenze decisive: nella fiaba i protagonisti sono anonimi e il finale è lieto; nel mito hanno un nome noto e il finale è spesso una punizione o una metamorfosi. Perseo è figlio di Zeus, la sua storia spiega la fondazione di Micene e gli si dedicava un culto." },
            { front: "Fiaba ↔ favola", back: "La coppia che si confonde di più, anche perché l'inglese chiama fable entrambe. La fiaba è lunga e piena di magia, la favola è cortissima e senza magia (gli animali parlano ma non ci sono incantesimi); la fiaba vuole appassionare, la favola correggere; la fiaba non ha morale scritta, la favola sì." },
            { front: "Leggenda ↔ fiaba", back: "La leggenda è ancorata: indica un luogo che puoi visitare, una data, una tomba. La fiaba è sradicata: il regno lontano non è su nessuna carta. È la differenza fra «quella roccia è il gigante pietrificato» e «c'era una volta un gigante»." },
          ],
        },
        {
          t: "flip",
          title: "Casi di confine: i confini si spostano",
          cards: [
            { front: "Romolo e Remo", back: "Leggenda per il luogo e la funzione (la fondazione di Roma), mito per la paternità divina di Marte e per i prodigi." },
            { front: "Re Artù", back: "Parte da un probabile condottiero britannico del VI secolo (leggenda) e si arricchisce di spade magiche e maghi (fiaba), fino a diventare il racconto identitario di un popolo." },
            { front: "L'Iliade", back: "Contiene mito (gli dèi che combattono), leggenda (una guerra probabilmente avvenuta intorno al 1200 a.C.) ed epica, cioè la forma letteraria che li raccoglie e li canta." },
          ],
        },
        { t: "note", title: "Un chiarimento utile", text: "Epica non è una quinta categoria parallela alle altre: è il genere letterario in versi che mette per iscritto e rielabora miti e leggende. L'Iliade è un poema epico costruito su materiale mitico e leggendario." },
        { t: "reveal", prompt: "Perché la fiaba è considerata un racconto «per bambini» e il mito no, anche quando le due storie si somigliano?", answer: "Perché nel mito c'era la fede: era sacro, legato al culto, creduto vero. La fiaba ha perso il sacro e dichiara fin dalla prima formula («c'era una volta») che nessuno la crede vera. Quando una comunità smette di credere in quegli dèi, il racconto sopravvive come intrattenimento e accompagnamento alla crescita." },
        { t: "quiz", question: "Una roccia che «è il gigante pietrificato» e che si può ancora visitare: di che racconto si tratta?", options: ["Fiaba", "Leggenda", "Favola", "Mito cosmogonico"], answer: 1, why: "È ancorata a un luogo reale che puoi vedere: una leggenda. La fiaba, invece, è «sradicata»." },
        { t: "quiz", question: "Quale racconto si chiude con una morale esplicita?", options: ["Il mito", "La leggenda", "La fiaba", "La favola"], answer: 3, why: "La favola è brevissima, con animali che rappresentano vizi o virtù, e dichiara la lezione in una riga finale." },
      ],
    },
  ],
);

const narratologia = make(
  "ita-narratologia",
  "Come è fatto un racconto: la narratologia",
  "Autore e narratore, fabula e intreccio, anacronie, ritmo, schema narrativo, personaggi, discorsi, spazio e tempo: gli attrezzi per smontare qualsiasi storia.",
  [
    {
      title: "Che cos'è la narratologia",
      text: "Che cosa si racconta, e come.",
      blocks: [
        { t: "p", text: "La narratologia è la disciplina che studia come sono costruiti i testi narrativi. Davanti a un racconto si osservano sempre due aspetti: che cosa viene raccontato (gli eventi, i personaggi, la storia) e come viene raccontato (l'ordine degli eventi, la voce che narra, il ritmo, le tecniche)." },
        { t: "p", text: "La stessa vicenda, raccontata in due modi diversi, produce due racconti diversi. Per questo in un testo narrativo contenuto e forma contano allo stesso modo: chi sa riconoscere le tecniche capisce non soltanto che cosa succede, ma perché il racconto lo coinvolge, lo sorprende o lo tiene in sospeso." },
        { t: "h", text: "Autore e narratore: mai confonderli" },
        {
          t: "flip",
          title: "Due figure diverse",
          cards: [
            { front: "Autore", back: "La persona reale che ha scritto l'opera. Sta fuori dal testo, nel mondo reale. Ha una data di nascita e una biografia." },
            { front: "Narratore", back: "La voce che racconta la storia. Sta dentro il testo: è un'invenzione dell'autore e esiste solo sulla pagina." },
          ],
        },
        { t: "note", title: "Un esempio", text: "In Una questione privata l'autore è Beppe Fenoglio; il narratore è la voce che racconta le vicende di Milton. Anche quando un racconto è scritto in prima persona, quell'«io» è il narratore, non l'autore." },
        { t: "quiz", question: "In un romanzo scritto in prima persona, chi dice «io»?", options: ["L'autore", "Il narratore", "Il lettore", "Il personaggio più importante, sempre"], answer: 1, why: "L'«io» è il narratore, una voce inventata dall'autore, anche quando assomiglia all'autore." },
      ],
    },
    {
      title: "Fabula e intreccio",
      text: "Come sono andati i fatti, e come me li racconti.",
      blocks: [
        { t: "p", text: "La fabula è la successione degli avvenimenti nel loro ordine logico e cronologico, cioè nell'ordine in cui sono accaduti. L'intreccio è l'ordine in cui il narratore decide di presentare gli stessi avvenimenti nel testo. Se il narratore racconta tutto nell'esatto ordine in cui è avvenuto, fabula e intreccio coincidono; altrimenti sono diversi." },
        {
          t: "sort",
          title: "Fabula o intreccio?",
          buckets: ["Fabula", "Intreccio"],
          items: [
            { text: "Marco si sveglia → va a scuola → fa una verifica → torna a casa", bucket: 0, why: "I fatti sono nell'ordine cronologico in cui accadono." },
            { text: "Marco torna a casa → ricorda la verifica → ricorda quando si è svegliato", bucket: 1, why: "Gli stessi fatti, ma presentati in un ordine scelto dal narratore." },
          ],
        },
        { t: "note", title: "Da ricordare", text: "Fabula = come sono successi i fatti. Intreccio = come me li racconti. La fabula non è scritta da nessuna parte: è il lettore che la ricostruisce, rimettendo in ordine gli eventi." },
        { t: "reveal", prompt: "Perché un narratore dovrebbe scegliere di non raccontare i fatti in ordine? Che cosa si guadagna aprendo un racconto dalla fine?", answer: "Si guadagna curiosità e tensione: il lettore vuole sapere come si è arrivati lì. Si può anche mettere in evidenza ciò che al narratore sta più a cuore, o creare un effetto di sorpresa o di mistero." },
      ],
    },
    {
      title: "Sequenze, anacronie e ritmo",
      text: "Il narratore gioca con l'ordine e con la velocità.",
      blocks: [
        { t: "h", text: "Le sequenze" },
        { t: "p", text: "Una sequenza è una parte del testo che costituisce un'unità riconoscibile, dotata di senso compiuto. Si passa a una nuova sequenza quando cambia qualcosa di importante: il tempo (il giorno dopo…), il luogo (intanto, in città…), i personaggi (qualcuno entra o esce di scena), l'azione, l'argomento o la situazione. Dividere un racconto in sequenze e dare a ciascuna un titolo breve è il primo passo per riassumerlo e per ricostruirne la fabula." },
        { t: "h", text: "Le anacronie" },
        { t: "p", text: "Quando il narratore modifica l'ordine cronologico degli avvenimenti si producono delle anacronie. Sono due: il flashback (o retrospezione, o analessi), che interrompe il presente e racconta qualcosa che è accaduto prima, e l'anticipazione (o flashforward, o prolessi), che anticipa qualcosa che accadrà dopo." },
        { t: "note", title: "Attenzione al trabocchetto", text: "Un personaggio che dice «Domani andrò a Roma» esprime un'intenzione: non è un'anticipazione. Nel flashforward è il narratore ad anticipare un fatto che nella storia accadrà davvero." },
        {
          t: "sort",
          title: "Flashback, anticipazione o nessuna anacronia?",
          buckets: ["Flashback", "Anticipazione", "Nessuna anacronia"],
          items: [
            { text: "Luca entrò nella sua vecchia scuola. Ricordò il suo primo giorno di prima media.", bucket: 0, why: "Dal presente si torna al passato." },
            { text: "Luca non poteva sapere che quella sarebbe stata l'ultima volta che avrebbe visto Marco.", bucket: 1, why: "È il narratore a dire che cosa accadrà dopo." },
            { text: "«Domani andrò a Roma», disse Marco.", bucket: 2, why: "È un'intenzione del personaggio, non il narratore che anticipa." },
            { text: "Anni prima, sua nonna gli aveva regalato quell'orologio.", bucket: 0, why: "Racconta un fatto precedente al presente della storia." },
            { text: "Non immaginava che l'avrebbe rivista solo dopo vent'anni.", bucket: 1, why: "Il narratore anticipa un fatto futuro." },
          ],
        },
        { t: "h", text: "La velocità: TS e TR" },
        { t: "p", text: "Il narratore può raccontare gli eventi più lentamente o più velocemente. La velocità dipende dal rapporto tra due tempi: il tempo della storia (TS), cioè quanto durano gli avvenimenti, e il tempo del racconto (TR), cioè quanto spazio occupano nel testo. Dieci anni possono stare in una riga; cinque minuti possono occupare tre pagine. Osservare dove il narratore rallenta significa capire che cosa ritiene importante." },
        {
          t: "flip",
          title: "Le quattro strategie del ritmo",
          cards: [
            { front: "Scena · TR = TS", back: "Il racconto procede alla stessa velocità degli eventi, soprattutto nei dialoghi. In una parola: racconto." },
            { front: "Sommario · TR < TS", back: "Molti avvenimenti vengono riassunti in poche parole: «Nei tre anni successivi Luca cambiò scuola, città e amici». In una parola: riassumo." },
            { front: "Ellissi · TR = 0", back: "Un periodo di tempo viene saltato del tutto: «Dieci anni dopo, Luca tornò in città». In una parola: salto." },
            { front: "Pausa · TS = 0", back: "La storia si ferma mentre il narratore descrive o riflette. In una parola: mi fermo." },
          ],
        },
        {
          t: "sort",
          title: "Quale strategia usa il narratore?",
          buckets: ["Scena", "Sommario", "Ellissi", "Pausa"],
          items: [
            { text: "«Dove vai?» chiese Anna. «A casa», rispose Luca.", bucket: 0, why: "Dialogo: il tempo del racconto è uguale a quello della storia." },
            { text: "Nei tre anni successivi Luca cambiò scuola, città e amici.", bucket: 1, why: "Tre anni raccontati, ma in fretta." },
            { text: "Dieci anni dopo, Luca tornò in città.", bucket: 2, why: "Di quei dieci anni non sappiamo nulla." },
            { text: "Luca era alto, magro, pallido, con gli occhi scuri e i capelli spettinati…", bucket: 3, why: "La storia si ferma mentre si descrive." },
          ],
        },
        { t: "quiz", question: "Qual è la differenza tra sommario ed ellissi?", options: ["Nel sommario il tempo trascorso viene raccontato, anche in fretta; nell'ellissi non viene raccontato affatto", "Sono la stessa cosa", "Il sommario è nei dialoghi, l'ellissi nelle descrizioni", "L'ellissi dura più del sommario"], answer: 0, why: "Nel sommario il tempo è riassunto; nell'ellissi è saltato (TR = 0)." },
      ],
    },
    {
      title: "Schema narrativo e ruoli",
      text: "I cinque momenti di una storia e chi li vive.",
      blocks: [
        { t: "p", text: "Molti racconti si possono organizzare secondo una successione di cinque momenti. Il nuovo equilibrio dello scioglimento non coincide con quello di partenza: può essere migliore o peggiore, ma qualcosa è cambiato." },
        {
          t: "seq",
          title: "I cinque momenti dello schema narrativo",
          items: [
            "Situazione iniziale: si presenta il punto di partenza (personaggi, rapporti, luogo, tempo)",
            "Esordio: un avvenimento rompe l'equilibrio e mette in moto la vicenda",
            "Peripezie: si susseguono gli avvenimenti e le difficoltà che formano la trama",
            "Spannung: il momento di massima tensione (un conflitto, un pericolo, una scelta decisiva)",
            "Scioglimento: la vicenda si conclude e si arriva a un nuovo equilibrio",
          ],
          why: "Spannung è una parola tedesca che significa «tensione».",
        },
        { t: "note", title: "Non tutti i racconti rispettano lo schema", text: "Un racconto può cominciare in medias res, cioè direttamente nel mezzo dell'azione, oppure avere un finale aperto, nel quale non tutto viene chiarito." },
        {
          t: "flip",
          title: "I ruoli dei personaggi",
          cards: [
            { front: "Protagonista (o eroe)", back: "È il personaggio principale: vuole qualcosa." },
            { front: "Oggetto del desiderio", back: "È ciò che il protagonista vuole ottenere: una persona, un oggetto, un obiettivo (amore, successo, libertà, vendetta…)." },
            { front: "Antagonista (o oppositore)", back: "È chi o ciò che ostacola il protagonista. Non è per forza una persona: può essere una malattia, una legge, la natura, una paura." },
            { front: "Aiutante", back: "È chi aiuta un personaggio a raggiungere il suo obiettivo; può esserci un aiutante del protagonista e uno dell'antagonista." },
          ],
        },
        { t: "p", text: "I ruoli non sono etichette fisse: un personaggio può cambiare ruolo nel corso della vicenda. I personaggi si distinguono inoltre in principali, che hanno un ruolo centrale, e secondari, che hanno un ruolo meno importante o compaiono brevemente." },
        { t: "reveal", prompt: "Nei miti letti finora, chi è l'antagonista quando l'ostacolo non è una persona?", answer: "Può essere il destino, la natura, una divinità che punisce o una colpa originaria: per esempio nel mito di Aracne l'ostacolo è la dea Atena (una persona), ma in altre storie l'ostacolo può essere la morte, il diluvio, la fame." },
      ],
    },
    {
      title: "I personaggi",
      text: "Come vengono presentati, come cambiano, come si descrivono.",
      blocks: [
        { t: "h", text: "Come viene presentato un personaggio" },
        {
          t: "sort",
          title: "Chi ci presenta il personaggio?",
          buckets: ["Narratore", "Un altro personaggio", "Autopresentazione", "Presentazione indiretta"],
          items: [
            { text: "Era un uomo timido e insicuro.", bucket: 0, why: "Il narratore dice direttamente com'è." },
            { text: "«Marco è sempre stato generoso», disse Anna.", bucket: 1, why: "Qualcuno della storia lo giudica." },
            { text: "«Sono una persona molto testarda.»", bucket: 2, why: "Il personaggio parla di sé." },
            { text: "Vede un anziano in difficoltà e corre ad aiutarlo.", bucket: 3, why: "Nessuno lo dice: il lettore lo capisce dall'azione." },
          ],
        },
        { t: "note", title: "Non tutte le voci sono affidabili", text: "Un personaggio che ne giudica un altro, o che parla di sé, può sbagliare o mentire. Nella presentazione indiretta il testo non dice «era generoso»: lo si capisce dal comportamento. La presentazione può anche essere mista, cioè fatta con più modalità insieme." },
        { t: "h", text: "Statico o dinamico, tipo o individuo" },
        {
          t: "flip",
          title: "Due distinzioni diverse: non confonderle",
          cards: [
            { front: "Statico", back: "Non cambia in modo significativo: resta sostanzialmente uguale dall'inizio alla fine." },
            { front: "Dinamico", back: "Si trasforma: può maturare, peggiorare, cambiare opinione, comportamento o modo di vedere il mondo. Esempio: Luca all'inizio è egoista, poi comprende l'importanza degli altri e diventa generoso." },
            { front: "Tipo", back: "Costruito con pochi tratti essenziali e facilmente riconoscibili: l'avaro, l'innamorato, il coraggioso, il bugiardo." },
            { front: "Individuo", back: "Personaggio complesso e sfaccettato: ha sentimenti contraddittori, dubbi, qualità e difetti, e assomiglia a una persona reale." },
          ],
        },
        { t: "p", text: "Statico/dinamico riguarda il cambiamento nel tempo; tipo/individuo riguarda la complessità. Di solito però i tipi sono statici e gli individui tendono a essere dinamici." },
        { t: "h", text: "Il ritratto: cinque elementi da osservare" },
        {
          t: "steps",
          title: "Per capire davvero un personaggio",
          items: [
            { title: "Aspetto fisico", text: "Età, corporatura, volto, abbigliamento." },
            { title: "Carattere e comportamento", text: "Timido, impulsivo, generoso, aggressivo; come agisce nelle diverse situazioni." },
            { title: "Condizione sociale", text: "Famiglia, professione, ricchezza o povertà, ambiente." },
            { title: "Modo di pensare", text: "Idee, valori, convinzioni, desideri." },
            { title: "Cultura e modo di esprimersi", text: "Linguaggio, lessico, dialetto, livello culturale." },
          ],
        },
        { t: "note", title: "Se un dettaglio c'è, ha una funzione", text: "L'autore non descrive tutto: seleziona. Sceglie le caratteristiche utili a farci comprendere il personaggio e il suo ruolo." },
        { t: "quiz", question: "È più efficace un narratore che dice «era generoso» o uno che mostra il personaggio mentre compie un gesto generoso?", options: ["Il primo: è più veloce", "Il secondo: il lettore lo capisce da solo e lo ricorda di più", "Sono uguali", "Dipende solo dalla lunghezza"], answer: 1, why: "La presentazione indiretta lascia al lettore il piacere di capire e resta più impressa." },
      ],
    },
    {
      title: "Discorsi e pensieri",
      text: "Due domande per orientarsi tra i modi di riportare le parole.",
      blocks: [
        { t: "p", text: "Il narratore può riportare ciò che i personaggi dicono o pensano in modi diversi. Per orientarsi bastano due domande. Sento le parole esatte del personaggio? Se sì, il discorso è diretto; se è il narratore a riferirle, è indiretto. C'è un verbo che introduce le parole (dire, chiedere, rispondere, gridare, pensare…)? Se sì, il discorso è legato; se manca, è libero." },
        {
          t: "sort",
          title: "Che tipo di discorso è?",
          buckets: ["Diretto legato", "Diretto libero", "Indiretto legato", "Indiretto libero"],
          items: [
            { text: "Marco disse: «Non vengo a scuola».", bucket: 0, why: "Parole esatte, virgolette e verbo introduttivo (disse)." },
            { text: "«Dove vai?» «A casa.» «Quando torni?» «Domani.»", bucket: 1, why: "Parole esatte, ma senza verbo introduttivo: dialogo rapido." },
            { text: "Marco disse che non sarebbe andato a scuola.", bucket: 2, why: "Il narratore riferisce, con verbo introduttivo e «che»." },
            { text: "Marco si fermò. Che cosa doveva fare? Tornare a casa? Forse era troppo tardi.", bucket: 3, why: "Terza persona e passato, ma domande e dubbi sono del personaggio, senza verbo introduttivo." },
          ],
        },
        { t: "note", title: "Da diretto a indiretto", text: "Nel passaggio dal diretto all'indiretto cambiano persone e tempi verbali: Marco disse: «Sono stanco» diventa Marco disse che era stanco." },
        { t: "h", text: "Quando il personaggio parla a sé stesso" },
        {
          t: "sort",
          title: "Soliloquio, monologo interiore o flusso di coscienza?",
          buckets: ["Soliloquio", "Monologo interiore", "Flusso di coscienza"],
          items: [
            { text: "Luca pensò: «E adesso che cosa faccio?»", bucket: 0, why: "Il narratore lo segnala e compaiono i segni del discorso diretto." },
            { text: "Che fare adesso? Tornare indietro? No, ormai era troppo tardi.", bucket: 1, why: "Si entra direttamente nei pensieri, senza verbi introduttivi, ma il pensiero è ordinato." },
            { text: "la pioggia sul vetro come quella volta al mare la nonna il pane caldo chissà se ho chiuso il gas", bucket: 2, why: "Associazioni libere, nessuna punteggiatura, passaggi improvvisi." },
          ],
        },
        { t: "note", title: "Come riconoscere il flusso di coscienza", text: "Sintassi irregolare, frasi incomplete, passaggi improvvisi da un pensiero all'altro, punteggiatura scarsa o assente, associazioni in apparenza prive di logica. Non è un errore: è una scelta consapevole (la stessa che incontri nell'unità sulla punteggiatura)." },
        { t: "reveal", prompt: "Perché il discorso indiretto libero fa sentire il lettore più vicino al personaggio rispetto al discorso indiretto legato?", answer: "Perché sparisce il verbo introduttivo («pensò che…»): non c'è più un narratore che riferisce da fuori. La voce è quella del narratore, ma le domande, le esclamazioni e i dubbi sono quelli del personaggio, e il lettore entra direttamente nel suo punto di vista." },
      ],
    },
    {
      title: "Spazio e tempo",
      text: "Dove e quando, e che cosa significano.",
      blocks: [
        { t: "p", text: "Spazio e tempo dicono dove e quando avvengono i fatti. Possono essere un semplice sfondo, oppure avere un peso decisivo per comprendere personaggi, atmosfera e significato. Possono essere reali o realistici (Verona nel 2026) oppure immaginari (un pianeta sconosciuto nell'anno 5000)." },
        {
          t: "flip",
          title: "Il quando: due livelli",
          cards: [
            { front: "Tempo storico", back: "In quale epoca? Medioevo, Seconda guerra mondiale, anni Sessanta." },
            { front: "Tempo cronologico", back: "In quale momento preciso? Anno, mese, stagione, giorno, ora: «Era la sera del 24 dicembre 1944»." },
          ],
        },
        { t: "p", text: "Per il dove si individua prima lo spazio geografico (Italia, Sicilia, Verona, Roma) e poi si classifica l'ambiente: naturale (bosco, montagna, campagna, mare) oppure urbano (città, paese, quartiere); e insieme interno (casa, stanza, scuola, automobile, prigione) oppure esterno (piazza, strada, spiaggia, bosco). Le coppie si incrociano: una casa di Milano è uno spazio urbano e interno; un bosco è naturale ed esterno." },
        {
          t: "sort",
          title: "Naturale o urbano?",
          buckets: ["Naturale", "Urbano"],
          items: [
            { text: "il mare", bucket: 0, why: "Ambiente naturale." },
            { text: "un quartiere", bucket: 1, why: "Ambiente urbano." },
            { text: "una montagna", bucket: 0, why: "Ambiente naturale." },
            { text: "una piazza", bucket: 1, why: "Ambiente urbano (ed esterno)." },
            { text: "un bosco", bucket: 0, why: "Naturale ed esterno." },
            { text: "una stazione", bucket: 1, why: "Ambiente urbano." },
          ],
        },
        { t: "h", text: "Il valore simbolico" },
        { t: "p", text: "Spazio e tempo non servono soltanto a collocare la storia: possono rispecchiare lo stato d'animo dei personaggi o suggerire un significato. Una stanza piccola, buia e soffocante può suggerire prigionia, angoscia, oppressione; un paesaggio luminoso e primaverile può suggerire gioia, serenità, rinascita. Anche la luce e il buio, i colori, il clima, gli oggetti e l'arredamento possono avere valore simbolico. La domanda da porsi è sempre la stessa: perché il narratore ha scelto proprio questo luogo e questo momento?" },
        { t: "reveal", prompt: "Quale luogo sceglieresti per ambientare un racconto sulla solitudine? E uno sulla libertà?", answer: "Per la solitudine, per esempio, una stanza vuota, una stazione di notte, una piazza senza nessuno. Per la libertà, uno spazio aperto: una cima, il mare, una strada in discesa. Non c'è una risposta unica: conta saper spiegare perché quel luogo rispecchia l'idea." },
      ],
    },
    {
      title: "Mettiti alla prova: il racconto di Giulia",
      text: "Un racconto scritto apposta per questa lezione: applica tutti gli attrezzi.",
      blocks: [
        { t: "p", text: "Leggi con attenzione. I numeri tra parentesi quadre indicano le righe." },
        { t: "p", text: "[1] Erano le sette di sera di un venerdì di novembre, e sulla città pioveva da tre giorni. [2] Giulia aveva quattordici anni, i capelli corti, uno zaino troppo grande e l'abitudine di mordersi il labbro quando non sapeva che cosa dire. [3] Stava ferma davanti alla porta della palestra, con la mano sulla maniglia." },
        { t: "p", text: "[4] Due mesi prima, il giorno delle selezioni, l'allenatore l'aveva guardata appena e aveva scritto un altro nome sul foglio. [5] Da allora si era allenata da sola, ogni pomeriggio, nel cortile dietro casa: aveva consumato due paia di scarpe e la pazienza dei vicini." },
        { t: "p", text: "[6] Entrare? E se l'avessero mandata via di nuovo? No, questa volta non poteva andare così. [7] Spinse la porta." },
        { t: "p", text: "[8] «Che cosa vuoi?» [9] «Provare ancora.» [10] «Le selezioni sono chiuse.» [11] «Lo so.»" },
        { t: "p", text: "[12] L'allenatore disse che poteva restare fino alla fine dell'allenamento, e che poi avrebbero visto. [13] Nessuno dei due immaginava che quella sera sarebbe cominciata una storia lunga sei campionati." },
        { t: "p", text: "[14] Un'ora dopo Giulia uscì nella pioggia. [15] Pensò: «Domani porto le scarpe nuove»." },
        {
          t: "seq",
          title: "1 · Ricostruisci la fabula",
          hint: "Metti gli avvenimenti nell'ordine cronologico in cui sono accaduti.",
          items: [
            "Alle selezioni Giulia viene esclusa",
            "Si allena da sola per due mesi",
            "Una sera di novembre è davanti alla palestra",
            "Esita, poi entra",
            "Parla con l'allenatore e resta all'allenamento",
            "Esce nella pioggia",
            "In futuro giocherà sei campionati",
          ],
          why: "Fabula e intreccio non coincidono: il racconto parte dalla sera di novembre e solo dopo torna alle selezioni.",
        },
        {
          t: "sort",
          title: "2 · Flashback o anticipazione?",
          buckets: ["Flashback", "Anticipazione", "Nessuna delle due"],
          items: [
            { text: "Righe 4-5: «Due mesi prima, il giorno delle selezioni…»", bucket: 0, why: "Dal presente si torna indietro: il flashback." },
            { text: "Riga 13: «Nessuno dei due immaginava che quella sera sarebbe cominciata una storia lunga sei campionati»", bucket: 1, why: "È il narratore ad anticipare un fatto che accadrà davvero." },
            { text: "Riga 15: «Domani porto le scarpe nuove»", bucket: 2, why: "È un'intenzione del personaggio, non un'anticipazione del narratore." },
          ],
        },
        {
          t: "sort",
          title: "3 · Il ritmo del narratore",
          buckets: ["Scena", "Sommario", "Ellissi", "Pausa"],
          items: [
            { text: "Riga 2: descrizione di Giulia", bucket: 3, why: "La storia si ferma mentre il narratore descrive." },
            { text: "Riga 5: due mesi di allenamenti in una frase", bucket: 1, why: "Molti avvenimenti riassunti in poche parole." },
            { text: "Righe 8-11: il dialogo", bucket: 0, why: "Il dialogo procede alla stessa velocità degli eventi." },
            { text: "Riga 14: «Un'ora dopo…»", bucket: 2, why: "L'allenamento non viene raccontato: salto." },
          ],
        },
        {
          t: "sort",
          title: "4 · Che tipo di discorso è?",
          buckets: ["Diretto libero", "Indiretto legato", "Indiretto libero", "Soliloquio"],
          items: [
            { text: "Riga 6: «Entrare? E se l'avessero mandata via di nuovo?…»", bucket: 2, why: "Terza persona e passato, senza verbo introduttivo, con i dubbi del personaggio." },
            { text: "Righe 8-11: il dialogo", bucket: 0, why: "Parole esatte senza verbo introduttivo." },
            { text: "Riga 12: «L'allenatore disse che poteva restare…»", bucket: 1, why: "Il narratore riferisce, con verbo introduttivo (disse che)." },
            { text: "Riga 15: Pensò: «Domani porto le scarpe nuove»", bucket: 3, why: "Un pensiero in forma di discorso diretto legato: soliloquio." },
          ],
        },
        {
          t: "steps",
          title: "5, 6 e 7 · Tempo, luogo, ruoli e struttura: premi «Avanti»",
          items: [
            { title: "Tempo e ambiente", text: "Tempo cronologico: le sette di sera di un venerdì di novembre; il tempo storico non è precisato, ma è un'epoca contemporanea. Ambiente urbano; esterno davanti alla porta, interno in palestra." },
            { title: "Valore simbolico della pioggia", text: "La pioggia che dura da tre giorni accompagna lo scoraggiamento e l'incertezza; alla fine piove ancora, ma Giulia la attraversa: è cambiata lei, non il tempo." },
            { title: "Ruoli", text: "Protagonista: Giulia. Oggetto del desiderio: entrare in squadra. Antagonista: all'inizio l'allenatore, ma anche la paura di essere respinta; l'allenatore cambia poi ruolo." },
            { title: "Presentazione di Giulia", text: "Riga 2: presentazione del narratore (aspetto fisico e un'abitudine che rivela il carattere). Riga 5: presentazione indiretta (la tenacia si capisce da ciò che fa)." },
            { title: "Spannung e inizio", text: "La Spannung è tra le righe 6 e 11: l'esitazione davanti alla porta e il confronto con l'allenatore. Il racconto comincia in medias res: Giulia è già davanti alla porta, e l'antefatto arriva dopo." },
          ],
        },
      ],
    },
  ],
);

const riassunto = make(
  "ita-riassunto",
  "Come fare un riassunto",
  "Il metodo in cinque passaggi: sequenze, idee-nucleo, riscrittura, connettivi. Con un esempio svolto per intero e gli errori da evitare.",
  [
    {
      title: "Che cos'è (e che cosa non è)",
      text: "Riassumere non è «scrivere lo stesso testo più corto».",
      blocks: [
        { t: "p", text: "Riassumere è un lavoro di selezione (che cosa è essenziale e che cosa no) e di riscrittura (dirlo con parole tue, non con quelle dell'autore). Chi sa fare bene un riassunto ha già capito il testo: per questo è una delle abilità più utili dell'anno, e ti servirà in ogni materia, non solo in italiano." },
        {
          t: "sort",
          title: "È un riassunto o no?",
          buckets: ["È un riassunto", "Non è un riassunto"],
          items: [
            { text: "Cancellare alcune frasi dal testo e tenere le altre così come sono scritte", bucket: 1, why: "Questo è un collage, non un riassunto: mancano la riscrittura e le parole tue." },
            { text: "Un testo nuovo, più breve, con solo le informazioni essenziali", bucket: 0, why: "Esatto: nuovo, breve, essenziale." },
            { text: "Un elenco di tutto quello che ti ricordi, senza ordine", bucket: 1, why: "Manca la selezione e manca l'ordine logico." },
            { text: "Scritto con parole tue, mantenendo il senso esatto dell'originale", bucket: 0, why: "Riformulare senza tradire il significato è il cuore del riassunto." },
            { text: "Un commento personale su ciò che pensi del testo", bucket: 1, why: "Il riassunto dice che cosa dice il testo, non che cosa ne pensi tu." },
            { text: "Organizzato nello stesso ordine logico del testo di partenza", bucket: 0, why: "Di solito il riassunto segue l'ordine del testo." },
          ],
        },
      ],
    },
    {
      title: "Le sequenze e il loro peso",
      text: "Prima di tagliare, bisogna capire che tipo di sequenza hai davanti.",
      blocks: [
        { t: "p", text: "Una sequenza è una porzione di testo che si riconosce perché ha una sua unità: riguarda un solo momento, un solo luogo, un solo argomento o una sola azione. Quando cambia il tempo, il luogo, chi sta parlando o l'argomento, comincia una nuova sequenza. Nei libri di scuola i paragrafi già scritti dall'autore spesso (ma non sempre) coincidono con le sequenze: dividere in sequenze, in pratica, vuol dire quasi sempre ragionare un paragrafo alla volta." },
        {
          t: "flip",
          title: "I cinque tipi di sequenza",
          cards: [
            { front: "Narrativa", back: "Racconta un'azione: c'è un prima e un dopo, qualcosa succede." },
            { front: "Descrittiva", back: "«Ferma» il racconto per descrivere un luogo, una persona, un oggetto: il tempo non avanza." },
            { front: "Riflessiva o argomentativa", back: "L'autore (o un personaggio) riflette, spiega un'idea, sostiene una tesi." },
            { front: "Dialogica", back: "Parlano i personaggi, in discorso diretto." },
            { front: "Informativa o espositiva", back: "Spiega fatti, dati, concetti: è il tipo più comune nei testi di manuale." },
          ],
        },
        {
          t: "sort",
          title: "Quanto spazio merita nel riassunto?",
          hint: "Narrativa e informativa sono il cuore; la descrittiva si riduce; la dialogica si trasforma.",
          buckets: ["Si tiene", "Si riduce molto", "Si trasforma"],
          items: [
            { text: "Sequenza narrativa: i fatti che accadono", bucket: 0, why: "Sono il cuore del riassunto: non si possono tagliare." },
            { text: "Sequenza informativa: fatti e concetti di un manuale", bucket: 0, why: "Qui ci sono i concetti che non puoi tagliare." },
            { text: "Descrizione lunga mezza pagina", bucket: 1, why: "Diventa una parola o una breve frase («un bosco silenzioso»)." },
            { text: "Un dialogo lungo una pagina intera", bucket: 2, why: "Non si riduce di poco: si trasforma in discorso indiretto, in poche righe." },
            { text: "Riflessione che contiene la tesi o il senso generale", bucket: 0, why: "Va tenuta, perché contiene il senso del testo." },
            { text: "Commento secondario dell'autore", bucket: 1, why: "Si può accorciare molto." },
          ],
        },
        { t: "note", title: "Regola importante", text: "In un riassunto non si riporta mai un discorso diretto fra virgolette. Non Vattene subito! gridò Marco, ma Marco ordinò all'altro di andarsene. Quello che conta non sono le parole esatte, ma che cosa è stato detto o deciso." },
        {
          t: "fill",
          title: "Dal dialogo al riassunto",
          items: [
            { before: "Nel testo: «Vattene subito!» gridò Marco. Nel riassunto:", after: "", options: ["«Vattene subito!» gridò Marco.", "Marco ordinò all'altro di andarsene.", "Marco gridava molto forte."], answer: 1, why: "Si passa al discorso indiretto e si tiene solo il contenuto." },
            { before: "Nel testo: «Ho fame», disse Anna. Nel riassunto:", after: "", options: ["Anna disse che aveva fame.", "«Ho fame», Anna.", "Anna era molto affamata e voleva mangiare subito."], answer: 0, why: "Discorso indiretto: cambiano persona e tempo verbale." },
          ],
        },
      ],
    },
    {
      title: "Il metodo in cinque passaggi",
      text: "Un procedimento, come un algoritmo.",
      blocks: [
        {
          t: "steps",
          title: "I cinque passaggi: premi «Avanti»",
          items: [
            { title: "1 · Prima lettura, senza scrivere nulla", text: "Serve solo a capire di che cosa parla il testo nel suo insieme. Se ti fermi a sottolineare già alla prima lettura, rischi di segnare tutto, perché non sai ancora che cosa è davvero importante." },
            { title: "2 · Seconda lettura, dividendo il testo in sequenze", text: "Ogni cambio di argomento, di tempo o di scena è una nuova sequenza. Nei testi informativi spesso coincidono con i paragrafi già scritti dall'autore." },
            { title: "3 · Per ogni sequenza, trova l'idea-nucleo", text: "Chiediti: «se potessi tenere una sola frase di questo paragrafo, quale sceglierei?». Elimina esempi, dettagli secondari, ripetizioni e frasi decorative." },
            { title: "4 · Riscrivi ogni idea-nucleo con parole tue", text: "Non copiare le frasi del testo: se stai solo tagliando via dei pezzi, non hai ancora fatto un riassunto, hai fatto un collage." },
            { title: "5 · Collega con i connettivi e rileggi", text: "Un buon riassunto si può tagliare ancora, quasi sempre." },
          ],
        },
        {
          t: "seq",
          title: "Ordina il metodo",
          items: [
            "Prima lettura, senza scrivere",
            "Seconda lettura, divisione in sequenze",
            "Idea-nucleo di ogni sequenza",
            "Riscrittura con parole tue",
            "Connettivi e rilettura finale",
          ],
          why: "Il metodo va dal capire (lettura) allo scegliere (sequenze e nuclei) allo scrivere (riscrittura e connettivi).",
        },
        { t: "note", title: "Le regole d'oro", text: "Scrivi in terza persona, anche se il testo è in prima. Mantieni un tempo verbale coerente (di solito il presente, oppure l'imperfetto se il testo è narrativo). Niente opinioni personali. Non aggiungere informazioni che non ci sono nel testo, anche se le conosci e sono vere. Mai discorso diretto fra virgolette. Lunghezza di riferimento: circa un terzo del testo di partenza, salvo indicazioni diverse." },
      ],
    },
    {
      title: "I connettivi",
      text: "Le parole che trasformano un elenco di frasi in un testo.",
      blocks: [
        { t: "p", text: "Un connettivo è una parola o una breve espressione che collega due frasi (o due idee) segnalando che relazione logica c'è fra loro: se una aggiunge un'informazione, spiega una causa, introduce un contrasto, indica un ordine nel tempo. Senza connettivi, un testo sembra un elenco di frasi staccate, anche quando le idee di partenza sono corrette." },
        {
          t: "flip",
          title: "Sei funzioni, sei famiglie di connettivi",
          cards: [
            { front: "Aggiungere un'informazione", back: "e, inoltre, in più, anche, oltre a questo" },
            { front: "Spiegare una causa", back: "perché, poiché, dato che, dal momento che" },
            { front: "Indicare una conseguenza", back: "quindi, perciò, di conseguenza, per questo motivo" },
            { front: "Introdurre un contrasto", back: "ma, però, tuttavia, al contrario, mentre" },
            { front: "Indicare un ordine nel tempo", back: "prima, poi, in seguito, infine, dopo" },
            { front: "Concludere o riassumere", back: "in conclusione, in sintesi, insomma, infine" },
          ],
        },
        {
          t: "fill",
          title: "Scegli il connettivo che descrive il rapporto",
          items: [
            { before: "Ho studiato molto,", after: "ho preso un bel voto.", options: ["quindi", "mentre", "inoltre"], answer: 0, why: "Il voto è la conseguenza dello studio." },
            { before: "Esco", after: "ho finito i compiti.", options: ["perché", "però", "infine"], answer: 0, why: "I compiti finiti sono la causa per cui posso uscire." },
            { before: "A me piace il mare,", after: "mio fratello preferisce la montagna.", options: ["perciò", "mentre", "poi"], answer: 1, why: "Due preferenze in contrasto." },
            { before: "Prima ho mangiato,", after: "sono uscito.", options: ["poi", "quindi", "tuttavia"], answer: 0, why: "Indica l'ordine nel tempo." },
            { before: "", after: ", il riassunto serve a studiare meglio.", options: ["In conclusione", "Però", "Perché"], answer: 0, why: "Chiude il ragionamento riassumendolo." },
          ],
        },
        { t: "note", title: "Variare", text: "Un buon riassunto usa almeno un connettivo da due o tre categorie diverse: se usi sempre e solo «e» o «poi», il testo funziona ma resta piatto. Scegli il connettivo che descrive davvero il rapporto fra le due idee." },
      ],
    },
    {
      title: "Un esempio svolto: la danza delle api",
      text: "Applichiamo il metodo a un testo informativo di circa 170 parole.",
      blocks: [
        { t: "p", text: "Le api mellifere hanno sviluppato uno dei sistemi di comunicazione più sorprendenti del mondo animale. Quando un'ape esploratrice trova una fonte di cibo abbondante, come un campo di fiori in piena fioritura, torna all'alveare e comunica alle altre api la posizione esatta del cibo attraverso una serie di movimenti chiamata «danza dell'addome», perché il percorso che l'ape traccia ricorda la forma del numero otto. La direzione in cui l'ape si muove durante la parte centrale della danza indica l'angolo tra il sole e la fonte di cibo; la velocità con cui ripete il movimento, invece, comunica la distanza: più la danza è lenta, più il cibo si trova lontano dall'alveare. Le altre api osservano attentamente la danza, ne memorizzano i dettagli, ed escono in volo dirigendosi con notevole precisione verso il luogo indicato, anche se si trova a diversi chilometri di distanza. Questo comportamento fu studiato per la prima volta in modo sistematico dal biologo austriaco Karl von Frisch negli anni Quaranta, il che gli valse il premio Nobel nel 1973." },
        {
          t: "steps",
          title: "Passaggio per passaggio",
          items: [
            { title: "Sequenze individuate", text: "1) Le api comunicano la posizione del cibo con una danza · 2) La danza indica direzione e distanza · 3) Le altre api interpretano e raggiungono il cibo · 4) Chi ha scoperto questo comportamento." },
            { title: "Idee-nucleo", text: "1) Danza a forma di 8 per segnalare il cibo · 2) Direzione = angolo col sole, velocità = distanza · 3) Le altre api volano dritte al punto indicato · 4) Scoperta di Karl von Frisch, Nobel 1973." },
            { title: "Riscrittura con parole proprie", text: "Le api comunicano la posizione di fonti di cibo attraverso una danza a forma di otto: la direzione del movimento indica l'angolo rispetto al sole, mentre la velocità comunica la distanza. Le altre api interpretano questi segnali e raggiungono il cibo con precisione. Questo comportamento fu scoperto dal biologo Karl von Frisch, che vinse il premio Nobel nel 1973." },
          ],
        },
        {
          t: "sort",
          title: "Idea-nucleo o dettaglio da tagliare?",
          buckets: ["Idea-nucleo: si tiene", "Dettaglio: si taglia"],
          items: [
            { text: "La danza ha la forma del numero otto", bucket: 0, why: "È il cuore del sistema di comunicazione." },
            { text: "come un campo di fiori in piena fioritura", bucket: 1, why: "È un esempio: serve a immaginare, non a capire." },
            { text: "La direzione indica l'angolo col sole, la velocità la distanza", bucket: 0, why: "Spiega come funziona il codice." },
            { text: "anche se si trova a diversi chilometri di distanza", bucket: 1, why: "Dettaglio che rafforza ma non è essenziale." },
            { text: "La scoperta è di Karl von Frisch, Nobel nel 1973", bucket: 0, why: "Chi e che cosa: informazione essenziale." },
            { text: "negli anni Quaranta", bucket: 1, why: "Dato troppo specifico: si taglia, mantenendo l'idea generale." },
          ],
        },
        { t: "quiz", question: "Il riassunto di 46 parole è ricavato da un testo di 170 parole. Quanto è lungo, in proporzione?", options: ["Circa la metà", "Circa un terzo", "Circa un quarto", "Circa un decimo"], answer: 2, why: "46 su 170 è poco più di un quarto, ma contiene tutte le informazioni essenziali: sono state tolte solo esempi e ripetizioni." },
      ],
    },
    {
      title: "Errori, narrativo o informativo, check list",
      text: "Gli ultimi controlli prima di consegnare.",
      blocks: [
        {
          t: "flip",
          title: "I quattro errori più comuni: tocca per la correzione",
          cards: [
            { front: "Copiare intere frasi cambiando solo qualche parola", back: "Chiudi il testo mentre scrivi il riassunto: se non puoi copiare, sei costretto a riformulare." },
            { front: "Includere tutti gli esempi e i dettagli numerici", back: "Tieni solo l'esempio più rappresentativo, se serve capire il concetto: quasi mai tutti." },
            { front: "Scrivere frasi staccate, senza connettivi", back: "Usa sempre almeno un connettivo per collegare due idee successive." },
            { front: "Confondere l'ordine di importanza", back: "Scrivi prima l'idea-nucleo di ogni sequenza (passaggio 3): i dettagli vengono dopo, se c'è spazio." },
          ],
        },
        {
          t: "flip",
          title: "Narrativo o informativo: che cosa cambia",
          cards: [
            { front: "Testo narrativo", back: "Segui la sequenza dei fatti: che cosa succede, in che ordine, a chi. I dettagli descrittivi (paesaggi, emozioni approfondite) quasi sempre si tagliano per primi." },
            { front: "Testo informativo o espositivo", back: "Segui la sequenza dei concetti: spesso titoli e paragrafi te la indicano già. I dati troppo specifici (numeri, nomi secondari) si tagliano per primi, mantenendo l'idea generale." },
          ],
        },
        {
          t: "mark",
          title: "Riassunto da correggere",
          prompt: "Tocca le frasi che NON vanno bene in un riassunto della danza delle api.",
          words: [
            "Le api comunicano la posizione del cibo con una danza a forma di otto.",
            "«Le api mellifere hanno sviluppato uno dei sistemi di comunicazione più sorprendenti del mondo animale»",
            "Secondo me è bellissimo che le api riescano a farlo.",
            "La velocità del movimento comunica la distanza.",
            "Io ho visto un documentario sulle api e c'erano anche i fiori gialli.",
          ],
          correct: [1, 2, 4],
          why: "La seconda copia le parole del testo; la terza è un'opinione personale; la quinta aggiunge informazioni che nel testo non ci sono.",
        },
        { t: "note", title: "Il riassunto come strumento di studio", text: "Fare un riassunto con parole tue è già, di per sé, recupero attivo: la stessa tecnica di studio più efficace. Se riesci a riassumere un capitolo senza guardare il testo, vuol dire che lo hai davvero capito; se non ci riesci, hai appena scoperto dove studiare meglio." },
        {
          t: "steps",
          title: "Check list finale prima di consegnare",
          items: [
            { title: "Parole mie", text: "Ho scritto con parole mie, senza copiare frasi intere dal testo?" },
            { title: "Solo l'essenziale", text: "Ho eliminato esempi e ripetizioni?" },
            { title: "Terza persona e tempo coerente", text: "Ho scritto in terza persona, con un tempo verbale coerente dall'inizio alla fine?" },
            { title: "Niente opinioni, niente aggiunte", text: "Ho evitato opinioni personali e informazioni che non c'erano nel testo?" },
            { title: "Dialoghi in indiretto", text: "Se il testo aveva dialoghi, li ho trasformati in discorso indiretto, senza virgolette?" },
            { title: "Lunghezza e connettivi", text: "Il riassunto è circa un terzo dell'originale, e le frasi sono collegate da connettivi?" },
          ],
        },
      ],
    },
  ],
);

const punteggiatura = make(
  "ita-punteggiatura",
  "La punteggiatura: i segnali stradali della scrittura",
  "A che cosa servono i segni, come sono nati in duemila anni, quando usare virgola, punto e virgola, due punti e il discorso diretto, e che cosa cambia in matematica, nel codice e nelle chat.",
  [
    {
      title: "A che cosa serve la punteggiatura",
      text: "Non a segnare dove si respira: a mostrare come è costruita la frase.",
      blocks: [
        { t: "p", text: "Quando parliamo abbiamo a disposizione la voce: le pause, il tono che sale o scende, la velocità, i gesti. Quando scriviamo tutto questo scompare, e resta soltanto una fila di parole. La punteggiatura (o interpunzione) è l'insieme dei segni che restituiscono al testo scritto l'ordine e, in parte, la voce." },
        { t: "p", text: "È diffusa l'idea che la virgola si metta «dove si respira». È un'idea sbagliata: nessuno respira fra il soggetto e il verbo, eppure molti vi mettono una virgola; e fra due frasi coordinate spesso non si fa alcuna pausa, eppure la virgola ci vuole. La punteggiatura segue prima di tutto la struttura della frase, cioè la sintassi, e soltanto in secondo luogo le pause della lettura." },
        { t: "note", title: "Un'immagine", text: "Chi guida non può chiedere la strada: legge i segnali. Chi legge non può interrompere chi ha scritto: legge i segni. I segni dicono dove fermarsi, dove rallentare, che cosa sta per arrivare." },
        {
          t: "steps",
          title: "Le quattro funzioni: premi «Avanti»",
          items: [
            { title: "Separare", text: "Divide il testo in unità: periodi, frasi, elementi di un elenco. È il lavoro del punto, della virgola, del punto e virgola." },
            { title: "Collegare e spiegare", text: "Indica il rapporto logico fra due parti: una causa, una conseguenza, un esempio, una precisazione. È il lavoro dei due punti, degli incisi, delle parentesi." },
            { title: "Dare il tono", text: "Segnala se la frase è una domanda, un'esclamazione, un pensiero lasciato in sospeso. È il lavoro del punto interrogativo, del punto esclamativo, dei puntini di sospensione." },
            { title: "Riportare le voci", text: "Distingue le parole di chi scrive dalle parole di qualcun altro: discorsi, citazioni, titoli. È il lavoro delle virgolette e delle lineette." },
          ],
        },
        {
          t: "sort",
          title: "Quale lavoro fa questo segno?",
          buckets: ["Separare", "Collegare e spiegare", "Dare il tono", "Riportare le voci"],
          items: [
            { text: "il punto", bucket: 0, why: "Chiude un periodo e separa i pensieri." },
            { text: "i due punti", bucket: 1, why: "Annunciano una spiegazione, un elenco, una conseguenza." },
            { text: "il punto interrogativo", bucket: 2, why: "Dà il tono di domanda." },
            { text: "le virgolette", bucket: 3, why: "Distinguono le parole degli altri." },
            { text: "il punto e virgola", bucket: 0, why: "Separa, ma tiene legato." },
            { text: "le parentesi", bucket: 1, why: "Aggiungono un'informazione accessoria." },
            { text: "i puntini di sospensione", bucket: 2, why: "Danno il tono di un pensiero lasciato in sospeso." },
            { text: "la lineetta", bucket: 3, why: "Introduce le battute di un dialogo." },
          ],
        },
      ],
    },
    {
      title: "Una virgola cambia tutto",
      text: "La prova che la punteggiatura non è un ornamento.",
      blocks: [
        { t: "p", text: "Ci sono frasi che cambiano significato quando un segno si sposta o scompare. Tocca le carte per scoprirlo." },
        {
          t: "flip",
          title: "Stesse parole, altro significato",
          cards: [
            { front: "Andiamo a mangiare, nonna!", back: "La nonna è salva. La virgola isola il vocativo: si sta parlando alla nonna, per invitarla a tavola." },
            { front: "Andiamo a mangiare nonna!", back: "La nonna è in pericolo. Senza la virgola «nonna» diventa il complemento oggetto di «mangiare»." },
            { front: "Gli studenti, che avevano studiato, superarono la prova.", back: "Fra due virgole la relativa è un'aggiunta: tutti gli studenti avevano studiato e tutti superarono la prova." },
            { front: "Gli studenti che avevano studiato superarono la prova.", back: "Senza virgole la relativa seleziona: superarono la prova soltanto quelli che avevano studiato." },
            { front: "Mentre il leone mangiava il domatore dormiva", back: "Senza una virgola dopo «mangiava» il lettore crede per un istante che il leone stia mangiando il domatore." },
            { front: "Il maestro dice: «Luca è un asino» / «Il maestro», dice Luca, «è un asino»", back: "Le parole sono identiche: a cambiare è soltanto la punteggiatura, e con essa chi parla e chi viene insultato." },
          ],
        },
        { t: "quiz", question: "«Marco mangia la mela» e «Marco, mangia la mela» sono diverse perché…", options: ["nella seconda c'è un ordine rivolto a Marco: il soggetto è diventato vocativo e il verbo imperativo", "nella seconda Marco non mangia", "la prima è una domanda", "sono uguali"], answer: 0, why: "La prima è un'informazione; la seconda è un ordine rivolto a Marco." },
        { t: "reveal", prompt: "Secondo la tradizione, un oracolo rispose a un soldato in partenza: «Ibis, redibis non, morieris in bello» oppure «Ibis, redibis, non morieris in bello». Perché l'oracolo non poteva mai sbagliare?", answer: "Parlata, la frase non ha pause: vale in due modi («Andrai, tornerai, non morirai in guerra» oppure «Andrai, non tornerai, morirai in guerra»). Comunque vada, l'oracolo ha ragione. Per iscritto, però, la virgola decide." },
      ],
    },
    {
      title: "Duemila anni per inventare i segni",
      text: "Ogni passo risponde a un bisogno pratico.",
      blocks: [
        { t: "p", text: "La punteggiatura non è nata insieme alla scrittura: è un'invenzione lenta, durata circa duemila anni. Il concetto fondamentale è questo: nasce e cresce man mano che la lettura smette di essere un'esecuzione ad alta voce e diventa un'attività silenziosa. Più il lettore è solo davanti alla pagina, più ha bisogno di segnali." },
        {
          t: "steps",
          title: "La linea del tempo: premi «Avanti»",
          items: [
            { title: "Grecia e Roma · scriptio continua", text: "Tutte le lettere attaccate, senza spazi fra le parole e quasi senza segni. I testi sono letti ad alta voce da chi li conosce già: la scrittura è un promemoria per la voce." },
            { title: "III-II sec. a.C. · Alessandria d'Egitto", text: "Aristofane di Bisanzio, bibliotecario, propone tre punti collocati a tre altezze diverse della riga, per pause di diversa durata: serve a chi deve leggere in pubblico i poeti antichi." },
            { title: "VII-IX sec. · i monaci copisti", text: "A partire da quelli irlandesi introducono lo spazio fra le parole; in età carolingia compare il punto interrogativo. Il latino non è più la lingua madre di chi copia e legge: servono aiuti visivi." },
            { title: "XIV sec. · punto esclamativo", text: "Compare il punto esclamativo. Si diffonde la lettura silenziosa e individuale: il testo deve «parlare» da solo." },
            { title: "1450 circa · Gutenberg", text: "La stampa a caratteri mobili: migliaia di copie identiche raggiungono lettori lontani, quindi i segni devono essere uguali per tutti." },
            { title: "1496-1501 · Venezia", text: "Lo stampatore Aldo Manuzio e l'umanista Pietro Bembo fissano la virgola nella forma moderna, il punto e virgola, l'apostrofo. Obiettivo: rendere i classici leggibili a un pubblico largo, in libri piccoli e maneggevoli." },
          ],
        },
        {
          t: "seq",
          title: "Rimetti in ordine la storia",
          items: [
            "Scriptio continua: tutto attaccato, a Roma",
            "Aristofane di Bisanzio inventa i tre punti ad Alessandria",
            "I monaci copisti introducono gli spazi fra le parole",
            "Gutenberg mette a punto la stampa a caratteri mobili",
            "Manuzio e Bembo fissano a Venezia la virgola moderna e il punto e virgola",
          ],
          why: "Più il lettore è solo e in silenzio davanti alla pagina, più ha bisogno di segnali.",
        },
        {
          t: "flip",
          title: "Quattro storie di punteggiatura",
          cards: [
            { front: "Venezia, 1496: Bembo, Manuzio e il punto e virgola", back: "Nel febbraio del 1496 Aldo Manuzio pubblica il De Aetna, un breve dialogo in latino in cui il giovane Pietro Bembo racconta la sua salita sull'Etna. Il libro è famoso per il carattere elegantissimo, che porta ancora il nome di Bembo, e per la punteggiatura: vi compaiono la virgola ricurva e il punto e virgola con il valore moderno. Nel Petrarca del 1501 l'apostrofo entra stabilmente nella scrittura del volgare." },
            { front: "Leopardi e la virgola che dà luce", back: "Leopardi curava la punteggiatura con estrema attenzione. In una lettera a Giordani scrive che la chiarezza è il primo debito dello scrittore e che spesso una sola virgola ben messa dà luce a tutto un periodo. La chiarezza come primo dovere di chi scrive è lo stesso principio di questa unità." },
            { front: "Ungaretti e Marinetti: scrivere senza punteggiatura", back: "Nel 1912 Marinetti proclama che bisogna abolire la punteggiatura. Pochi anni dopo Ungaretti, soldato in trincea, scrive poesie brevissime senza alcun segno: al posto delle virgole e dei punti ci sono gli a capo e lo spazio bianco. Togliere la punteggiatura è una scelta consapevole e non una dimenticanza: può permetterselo soltanto chi la conosce a fondo." },
            { front: "Mariner 1: il trattino più costoso della storia", back: "Il 22 luglio 1962 la NASA lancia la sonda Mariner 1 verso Venere. Dopo meno di cinque minuti il razzo devia e viene distrutto. L'inchiesta attribuisce il guasto a un piccolo segno omesso nella trascrizione di una formula: «il trattino mancante». Per una macchina un segno in meno è un altro programma." },
          ],
        },
      ],
    },
    {
      title: "Punto e virgola: i segni che separano",
      text: "Quattro segni, quattro forze: virgola, punto e virgola, due punti, punto.",
      blocks: [
        { t: "h", text: "Il punto" },
        { t: "p", text: "Il punto chiude un periodo, cioè un pensiero compiuto. È la pausa più forte; dopo il punto si riprende con la lettera maiuscola. Si usa «punto e a capo» quando cambia l'argomento, il momento, il luogo o il punto di vista: ogni capoverso sviluppa un'idea. Il punto si usa anche nelle abbreviazioni (prof., pag., ecc., a.C.) e non si mette dopo i titoli, dopo la data in testa a una lettera, dopo la firma, dopo il punto interrogativo e il punto esclamativo." },
        { t: "note", title: "Il difetto più comune", text: "Il periodo interminabile, tenuto insieme soltanto da virgole: «Ieri sono andato al parco, c'erano i miei amici, abbiamo giocato a pallone, poi ha cominciato a piovere». Il rimedio è semplice: quando un pensiero è finito, punto." },
        { t: "h", text: "La virgola: quando serve" },
        {
          t: "flip",
          title: "Sette usi della virgola",
          cards: [
            { front: "Negli elenchi", back: "Ho comprato pane, latte, uova e farina." },
            { front: "Con il vocativo", back: "Marco, chiudi la finestra. · Ascoltate, ragazzi, la consegna." },
            { front: "Per gli incisi", back: "Il treno, come al solito, era in ritardo." },
            { front: "Per le apposizioni", back: "Dante, il padre della lingua italiana, nacque a Firenze." },
            { front: "Dopo una subordinata che precede la principale", back: "Quando piove, resto a casa. · Se hai finito, puoi uscire." },
            { front: "Con le relative che aggiungono un'informazione", back: "Mio padre, che è nato a Verona, tifa per l'Hellas." },
            { front: "Prima di ma, però, tuttavia, anzi; dopo sì, no, bene, certo a inizio frase", back: "Ho studiato, ma non ricordo le date. · Sì, lo so. · No, grazie." },
          ],
        },
        { t: "note", title: "La regola d'oro dell'inciso", text: "Le virgole sono due: una che apre e una che chiude, come le parentesi. Per fare la prova, togli tutto ciò che sta fra le due virgole: se la frase regge ancora, l'inciso è punteggiato bene. «Il treno, come al solito, era in ritardo» → «Il treno era in ritardo»." },
        { t: "h", text: "La virgola: quando è vietata" },
        { t: "p", text: "La virgola non deve mai dividere due elementi che la sintassi tiene strettamente uniti: fra soggetto e verbo (Il mio compagno di banco ha perso il libro), fra verbo e complemento oggetto (Ho letto un romanzo bellissimo), fra verbo e frase che lo completa (Penso che tu abbia ragione), fra nome e aggettivo (Una giornata bellissima), fra nome e relativa che lo seleziona (Il libro che mi hai prestato è finito)." },
        {
          t: "punct",
          title: "Virgola sì, virgola no",
          hint: "In alcune frasi non serve nessuna virgola. Il punto finale è già da inserire.",
          marks: [",", ".", ";", ":"],
          items: [
            { words: ["Marco", "Luca", "e", "Giulia", "arriveranno", "domani"], solution: [",", "", "", "", "", "."], why: "Elenco: virgola fra gli elementi, prima della «e» non serve." },
            { words: ["Quando", "suona", "la", "campanella", "tutti", "escono", "in", "cortile"], solution: ["", "", "", ",", "", "", "", "."], why: "Subordinata prima della principale: virgola dopo la subordinata." },
            { words: ["Il", "professore", "di", "matematica", "ha", "spiegato", "le", "equazioni"], solution: ["", "", "", "", "", "", "", "."], why: "Nessuna virgola: soggetto e verbo restano uniti." },
            { words: ["Ragazzi", "aprite", "il", "libro", "a", "pagina", "venti"], solution: [",", "", "", "", "", "", "."], why: "«Ragazzi» è un vocativo: va isolato." },
            { words: ["Verona", "città", "d'arte", "e", "di", "storia", "è", "attraversata", "dall'Adige"], solution: [",", "", "", "", "", ",", "", "", "."], why: "«città d'arte e di storia» è un'apposizione: due virgole." },
            { words: ["Mia", "madre", "che", "lavora", "in", "ospedale", "stasera", "ha", "il", "turno", "di", "notte"], solution: ["", ",", "", "", "", ",", "", "", "", "", "", "."], why: "La relativa aggiunge un'informazione: è un inciso, due virgole." },
          ],
        },
        { t: "h", text: "Tre dubbi frequenti" },
        {
          t: "flip",
          title: "Prima di «e», «ma», «che»",
          cards: [
            { front: "Virgola prima di «e»?", back: "Di solito no: negli elenchi semplici non si mette (pane, latte e uova). Sì dopo un inciso (Luca, il più alto, e sua sorella) o quando collega due frasi con soggetti diversi che potrebbero confondersi (Ho salutato Anna, e Marta si è offesa)." },
            { front: "Virgola prima di «ma»?", back: "Sì fra due frasi (Volevo uscire, ma pioveva); si può omettere fra due parole (piccolo ma comodo)." },
            { front: "Virgola prima di «che»?", back: "Dipende dal «che»: mai se introduce una frase che completa il verbo (Credo che…) o una relativa che seleziona; sì, e in coppia, se la relativa è un'aggiunta." },
          ],
        },
        { t: "h", text: "Punto e virgola e due punti" },
        { t: "p", text: "Il punto e virgola indica una pausa intermedia: più forte della virgola, più debole del punto. Dopo si continua con la lettera minuscola. Ha due usi: separa due frasi autonome ma legate nel senso (Il primo tempo era stato equilibrato; nel secondo la squadra di casa dilagò) e separa gli elementi di un elenco complesso, quando al loro interno ci sono già delle virgole (Parteciparono Anna, di Verona; Paolo, di Vicenza; Sara, di Padova)." },
        { t: "p", text: "I due punti non chiudono: aprono. Annunciano che ciò che segue illustra, spiega o completa ciò che precede. Introducono un elenco (Nello zaino c'è tutto: il quaderno, l'astuccio, il libro), una spiegazione o una causa (Non sono uscito: pioveva a dirotto), una conseguenza (Ha studiato ogni giorno: la verifica è andata benissimo), il discorso diretto (Il professore disse: «Aprite il quaderno»)." },
        { t: "note", title: "Due attenzioni", text: "I due punti non si mettono fra il verbo e ciò che lo completa: prima dei due punti la frase deve già stare in piedi da sola. NO: Gli ingredienti sono: farina, uova e zucchero. SÌ: Gli ingredienti sono tre: farina, uova e zucchero. E nello stesso periodo conviene usarli una volta sola." },
        {
          t: "fill",
          title: "Il segno giusto",
          items: [
            { before: "Nello zaino ho messo tutto", after: "il quaderno, l'astuccio, il libro di storia e la merenda.", options: ["punto", "due punti", "punto e virgola"], answer: 1, why: "Annuncia un elenco." },
            { before: "Non sono uscito", after: "pioveva a dirotto.", options: ["due punti", "virgola", "punto e virgola"], answer: 0, why: "Spiega la causa." },
            { before: "Alla gara hanno partecipato Anna, di Verona", after: "Paolo, di Vicenza; Sara, di Padova.", options: ["virgola", "punto e virgola", "due punti"], answer: 1, why: "Elenco complesso: gli elementi contengono già delle virgole." },
            { before: "Se domani c'è il sole", after: "andiamo in bicicletta.", options: ["virgola", "due punti", "punto"], answer: 0, why: "Subordinata prima della principale." },
            { before: "Il professore disse", after: "«Aprite il quaderno».", options: ["virgola", "due punti", "punto e virgola"], answer: 1, why: "Introducono il discorso diretto." },
            { before: "Ho finito i compiti", after: "Adesso posso uscire.", options: ["punto", "virgola", "due punti"], answer: 0, why: "Pensiero compiuto: punto, e si riparte con la maiuscola." },
          ],
        },
        {
          t: "sort",
          title: "Quale errore hai davanti?",
          hint: "Smista ogni frase sbagliata nella sua categoria di errore.",
          buckets: ["Virgola fra soggetto e verbo", "Inciso con una sola virgola", "Virgola al posto del punto", "Virgola prima di «che» dichiarativo"],
          items: [
            { text: "La mia amica, abita a Verona.", bucket: 0, why: "Soggetto e verbo non si separano." },
            { text: "Luca, il mio vicino gioca a basket.", bucket: 1, why: "L'inciso vuole due virgole: «Luca, il mio vicino, gioca…»." },
            { text: "Era tardi, tornammo a casa, cenammo.", bucket: 2, why: "Tre pensieri compiuti uniti da virgole: servono punti." },
            { text: "So, che hai ragione.", bucket: 3, why: "Il «che» completa il verbo: nessuna virgola." },
          ],
        },
      ],
    },
    {
      title: "I segni che danno voce",
      text: "Domande, esclamazioni, sospensioni: e le parole degli altri.",
      blocks: [
        { t: "p", text: "Il punto interrogativo chiude le domande dirette (Che ore sono?) e non si usa nelle interrogative indirette, che finiscono con il punto fermo (Mi ha chiesto che ore fossero). Il punto esclamativo chiude le frasi che esprimono stupore, gioia, rabbia, un ordine (Che spettacolo! Fermati!): va usato con parsimonia, e nei testi scolastici se ne mette uno solo; le raffiche (!!!) e le combinazioni (?!) appartengono ai fumetti e alle chat. I puntini di sospensione sono sempre e soltanto tre: indicano un discorso lasciato in sospeso, un'esitazione, un'allusione (Se lo sapesse tuo padre…). Fra parentesi quadre, […], segnalano che in una citazione è stato omesso un pezzo." },
        { t: "note", title: "Dopo ? ! … non si aggiunge altro", text: "Dopo il punto interrogativo, il punto esclamativo e i puntini che chiudono la frase non si aggiunge il punto fermo e si riprende con la maiuscola." },
        {
          t: "sort",
          title: "Corretto o sbagliato?",
          buckets: ["Corretto", "Sbagliato"],
          items: [
            { text: "Dove vai?", bucket: 0, why: "Domanda diretta: punto interrogativo e basta." },
            { text: "Dove vai?.", bucket: 1, why: "Dopo il punto interrogativo non si aggiunge il punto." },
            { text: "Non so cosa dire…", bucket: 0, why: "Esattamente tre puntini." },
            { text: "Non so cosa dire.....", bucket: 1, why: "I puntini sono sempre e soltanto tre." },
            { text: "Che bello!", bucket: 0, why: "Un solo punto esclamativo." },
            { text: "Che bello!!!!", bucket: 1, why: "Le raffiche appartengono a fumetti e chat." },
            { text: "Mi chiedo dove sia finito.", bucket: 0, why: "Interrogativa indiretta: punto fermo." },
            { text: "Mi chiedo dove sia finito?", bucket: 1, why: "Nell'indiretta non si usa il punto interrogativo." },
          ],
        },
        { t: "h", text: "Virgolette, lineetta, trattino, parentesi" },
        {
          t: "flip",
          title: "Quattro segni che riportano e racchiudono",
          cards: [
            { front: "Le virgolette", back: "Tre tipi: basse o caporali « », alte “ ”, apici ‘ ’. Riportano un discorso diretto o una citazione, segnano i titoli (in alternativa al corsivo) o una parola usata in senso particolare o ironico. Quando una citazione ne contiene un'altra si scende di livello: «Mi ha detto: “Torno subito”, ma non è tornato». Scelto un tipo, lo si mantiene per tutto il testo." },
            { front: "La lineetta (—)", back: "Lunga e staccata dalle parole: introduce le battute di un dialogo e, in coppia, racchiude un inciso più forte di quello fra virgole: Il professore — nessuno se lo aspettava — annullò la verifica." },
            { front: "Il trattino (-)", back: "Corto e attaccato: unisce due parole o due numeri (la linea Verona-Milano, gli anni 1915-1918) e divide una parola a fine riga." },
            { front: "Le parentesi", back: "Le tonde racchiudono un'informazione accessoria (Giacomo Leopardi (1798-1837) nacque a Recanati): ciò che sta fra parentesi si deve poter togliere senza che la frase crolli. Le quadre segnalano un intervento di chi cita: un taglio, […], o una precisazione." },
          ],
        },
        { t: "h", text: "Il discorso diretto: dove vanno i segni" },
        { t: "p", text: "Il discorso diretto riporta le parole così come sono state pronunciate. Si può scrivere in tre modi, tutti corretti, purché non vengano mescolati: con le virgolette basse (Luca disse: «Arrivo subito».), con le virgolette alte (Luca disse: “Arrivo subito”.) o con la lineetta (Luca disse: — Arrivo subito.). Il punto interrogativo e il punto esclamativo appartengono alla battuta e stanno dentro le virgolette; il punto fermo e la virgola, nell'uso oggi più diffuso, stanno fuori. La battuta comincia con la maiuscola." },
        {
          t: "fill",
          title: "Quale versione è scritta bene?",
          items: [
            { before: "Introduzione prima della battuta:", after: "", options: ["Anna chiese: «Vieni con noi?»", "Anna chiese «Vieni con noi?».", "Anna chiese, «vieni con noi»?"], answer: 0, why: "Due punti prima della battuta; il punto interrogativo sta dentro le virgolette e dopo non si aggiunge altro." },
            { before: "Introduzione dopo la battuta:", after: "", options: ["«Non posso» rispose Paolo.", "«Non posso», rispose Paolo.", "«Non posso.» rispose Paolo."], answer: 1, why: "Dopo la battuta si mette la virgola, fuori dalle virgolette; «rispose» resta minuscolo." },
            { before: "Introduzione in mezzo:", after: "", options: ["«Non posso», rispose Paolo, «devo studiare».", "«Non posso» rispose Paolo «devo studiare».", "«Non posso», rispose Paolo. «devo studiare»."], answer: 0, why: "Due virgole attorno all'inciso «rispose Paolo»." },
          ],
        },
        { t: "h", text: "Alla tastiera: mai prima, sempre dopo" },
        { t: "p", text: "Punto, virgola, punto e virgola, due punti, punto interrogativo ed esclamativo sono attaccati alla parola che precede e seguiti da uno spazio. Parentesi e virgolette abbracciano il loro contenuto: lo spazio sta fuori, mai dentro. L'apostrofo non vuole spazi (l'albero, non l' albero). La lineetta è preceduta e seguita da uno spazio; il trattino no. Uno spazio solo fra una parola e l'altra, mai due." },
        {
          t: "fill",
          title: "Occhio agli spazi",
          items: [
            { before: "Quale riga rispetta gli spazi?", after: "", options: ["Sono arrivato tardi, perché ho perso l'autobus.", "Sono arrivato tardi , perché ho perso l' autobus .", "Sono arrivato tardi ,perché ho perso l'autobus."], answer: 0, why: "Nessuno spazio prima del segno, uno spazio dopo, apostrofo attaccato." },
            { before: "E questa?", after: "", options: ["Ti spiego dopo( forse ).", "Ti spiego dopo (forse).", "Ti spiego dopo ( forse )."], answer: 1, why: "La parentesi abbraccia il contenuto: lo spazio sta fuori, mai dentro." },
          ],
        },
      ],
    },
    {
      title: "Punteggiatura in una classe STEAM",
      text: "In matematica e nel codice sbagliare un segno vuol dire sbagliare il risultato.",
      blocks: [
        { t: "p", text: "Nella matematica e nell'informatica i segni di punteggiatura smettono di essere una questione di stile e diventano simboli con un valore preciso." },
        {
          t: "flip",
          title: "Lo stesso segno, due mondi",
          cards: [
            { front: "La virgola ,", back: "Nella lingua separa parole e frasi. In Italia separa i decimali: 3,14. Nei paesi anglosassoni e nei linguaggi di programmazione i decimali vogliono il punto: 3.14." },
            { front: "Il punto .", back: "Nella lingua chiude il periodo. In Italia separa le migliaia: 1.250 è milleduecentocinquanta. Su una calcolatrice americana 1.250 vale uno virgola venticinque." },
            { front: "I due punti :", back: "Indicano la divisione e il rapporto: 12 : 4 = 3; scala 1 : 25 000. In Python chiudono l'intestazione di un blocco: if x > 0:" },
            { front: "Il punto e virgola ;", back: "In C, Java e molti altri linguaggi chiude ogni istruzione: se manca, il programma non parte." },
            { front: "Il punto esclamativo !", back: "È il fattoriale: 5! = 5 · 4 · 3 · 2 · 1 = 120. Nel codice significa spesso «non»: != si legge «diverso da»." },
            { front: "Le parentesi ( )", back: "Stabiliscono l'ordine delle operazioni: (2 + 3) · 4 = 20, mentre 2 + 3 · 4 = 14." },
          ],
        },
        {
          t: "fill",
          title: "Calcola come un compilatore",
          items: [
            { before: "4! vale", after: ".", options: ["16", "24", "10"], answer: 1, why: "4! = 4 · 3 · 2 · 1 = 24." },
            { before: "(8 − 2) · 3 vale", after: ".", options: ["18", "2", "22"], answer: 0, why: "Prima la parentesi: 6 · 3 = 18." },
            { before: "8 − 2 · 3 vale", after: ".", options: ["18", "2", "24"], answer: 1, why: "Prima la moltiplicazione: 8 − 6 = 2. Le parentesi hanno cambiato l'ordine delle operazioni." },
            { before: "Su una carta in scala 1 : 25 000, 4 cm corrispondono a", after: ".", options: ["100 m", "1 km", "10 km"], answer: 1, why: "4 cm · 25 000 = 100 000 cm = 1 000 m = 1 km." },
            { before: "In if temperatura > 30 manca il segno", after: "e senza di esso il programma non parte.", options: ["; (punto e virgola)", ": (due punti)", ", (virgola)"], answer: 1, why: "In Python i due punti chiudono l'intestazione del blocco." },
          ],
        },
        { t: "quiz", question: "Su uno scontrino italiano leggi 1.250 e su una calcolatrice americana leggi 1.250. Quanto valgono?", options: ["Lo stesso: milleduecentocinquanta", "Lo scontrino 1250, la calcolatrice 1,25", "Lo scontrino 1,25, la calcolatrice 1250", "Nessuno dei due ha senso"], answer: 1, why: "In Italia il punto separa le migliaia; nei paesi anglosassoni il punto è la virgola decimale." },
        { t: "h", text: "E nelle chat?" },
        { t: "p", text: "Nei messaggi la punteggiatura segue regole diverse, perché diversa è la situazione: si scrive in fretta, a qualcuno che si conosce, e l'invio stesso fa da punto. Per questo il punto fermo alla fine di un messaggio breve viene spesso percepito come freddo o seccato: «Ok» e «Ok.» non suonano allo stesso modo. Le emoji svolgono in parte il lavoro del punto esclamativo e dei puntini: indicano il tono. Non c'è nulla di sbagliato: ogni situazione comunicativa ha il suo registro. L'errore nasce quando le abitudini della chat passano in un tema, in una verifica o in una mail a un insegnante." },
        { t: "reveal", prompt: "Un programma non parte per un punto e virgola mancante; un lettore umano capisce lo stesso. È un buon motivo per essere meno precisi quando si scrive per le persone?", answer: "No. Il lettore umano capisce, ma deve tornare indietro e fare fatica; la precisione è rispetto per chi legge. La stessa attenzione che una classe STEAM chiede a una formula o a una riga di codice vale per un testo." },
      ],
    },
    {
      title: "Sintesi: quale segno scelgo?",
      text: "Per punteggiare bene non serve ricordare tutte le regole: serve farsi la domanda giusta.",
      blocks: [
        {
          t: "steps",
          title: "Le cinque domande",
          items: [
            { title: "1 · Il pensiero è finito?", text: "Pensiero compiuto → punto. Cambia argomento → punto e a capo." },
            { title: "2 · Sto per spiegare, elencare, riportare?", text: "Annuncio → due punti → spiegazione, elenco, battuta." },
            { title: "3 · Due frasi autonome ma legate?", text: "Frase → punto e virgola → frase." },
            { title: "4 · Un elemento si può togliere?", text: "Inciso, apposizione, vocativo → due virgole." },
            { title: "5 · Due elementi sono inseparabili?", text: "Soggetto + verbo, verbo + oggetto → nessun segno." },
          ],
        },
        {
          t: "punct",
          title: "Il banco di prova: l'inizio di «Pinocchio»",
          hint: "Inserisci le virgole e i punti finali. Attenzione al vocativo e alla virgola dopo «No».",
          marks: [",", ".", ";", ":", "?", "!"],
          items: [
            { words: ["C'era", "una", "volta", "un", "re", "diranno", "subito", "i", "miei", "piccoli", "lettori"], solution: ["", "", "", "", ",", "", "", "", "", "", "."], why: "La frase che precede «diranno subito…» si stacca con una virgola." },
            { words: ["No", "ragazzi", "avete", "sbagliato"], solution: [",", ",", "", "."], why: "Dopo «No» a inizio frase serve la virgola; «ragazzi» è un vocativo." },
            { words: ["C'era", "una", "volta", "un", "pezzo", "di", "legno"], solution: ["", "", "", "", "", "", "."], why: "Frase semplice: solo il punto finale." },
          ],
        },
        {
          t: "mark",
          title: "Caccia all'errore",
          prompt: "Tocca le frasi punteggiate correttamente.",
          words: [
            "Il mio compagno di banco ha dimenticato il libro.",
            "Ho comprato, un quaderno nuovo.",
            "Che ore sono?",
            "Mi ha chiesto, se potevo aiutarlo.",
            "Luca disse: «Arrivo subito».",
            "Gli ingredienti sono: farina, uova e zucchero.",
          ],
          correct: [0, 2, 4],
          why: "Le altre contengono errori: virgola fra verbo e oggetto, virgola fra verbo e frase che lo completa, due punti fra verbo e complemento.",
        },
        { t: "note", title: "Che cosa ci insegna la punteggiatura", text: "Punteggiare significa mettersi dalla parte di chi legge. Ogni segno è un'indicazione data a un lettore che non può interromperci per chiedere che cosa volevamo dire: gli mostra dove finisce un pensiero, che cosa dipende da che cosa, chi sta parlando, con quale tono. Per questo la punteggiatura non è una questione di gusto né di respiro, ma di logica e di rispetto." },
        { t: "reveal", prompt: "La punteggiatura è una gabbia di regole o uno strumento di libertà per chi scrive?", answer: "Uno strumento di libertà: chi la conosce può scegliere (come Ungaretti, che la toglie per scelta), chi non la conosce subisce errori. Le regole servono a farsi capire alla prima lettura; solo chi le padroneggia può permettersi di rompere." },
      ],
    },
  ],
);

const ortografia = make(
  "ita-ortografia",
  "Ortografia: accento, apostrofo, h e maiuscole",
  "Scrivere giusto è rispetto per chi legge: le regole di accento, apostrofo, lettera h e maiuscole, con le prove per non sbagliare più.",
  [
    {
      title: "Perché scrivere giusto",
      text: "L'ortografia è un accordo fra chi scrive e chi legge.",
      blocks: [
        { t: "p", text: "L'ortografia è l'insieme delle regole che stabiliscono come si scrivono le parole. Non è un capriccio: è un accordo che permette a milioni di persone di leggere lo stesso testo e capirsi senza dover tornare indietro. Un errore di ortografia non cambia solo la forma: può cambiare il senso (ha / a, anno / hanno, è / e). Nella griglia di valutazione delle prove scritte, l'ortografia rientra, insieme alla punteggiatura, nell'indicatore della forma." },
        { t: "note", title: "Il metodo di questa lezione", text: "Per ogni regola impari una prova da fare nella tua testa: la sostituzione, l'allungamento, la lettura ad alta voce. Chi ha una prova non ha bisogno di ricordare un elenco di eccezioni." },
        {
          t: "sort",
          title: "Quale argomento ortografico riguarda?",
          buckets: ["Accento", "Apostrofo", "Lettera h", "Maiuscola"],
          items: [
            { text: "perché / perchè", bucket: 0, why: "Si tratta di accento acuto o grave." },
            { text: "un'amica / un amica", bucket: 1, why: "Elisione: l'apostrofo segna la vocale caduta." },
            { text: "ho / o", bucket: 2, why: "La h distingue due parole diverse." },
            { text: "giugno / Giugno", bucket: 3, why: "I mesi non vogliono la maiuscola." },
          ],
        },
      ],
    },
    {
      title: "L'accento",
      text: "Quando si scrive, quale usare, quali parole non ne vogliono.",
      blocks: [
        { t: "p", text: "In italiano l'accento si scrive obbligatoriamente sulle parole tronche di due o più sillabe (città, perché, caffè) e su alcune parole di una sola sillaba, dove serve a distinguere due parole uguali. Le parole monosillabe non vogliono accento (qui, qua, sto, sta, fa, fu, so, va, tre, blu), tranne quelle con due vocali (più, già, giù, può, ciò) e quelle che si confondono con un'altra." },
        {
          t: "flip",
          title: "Le coppie da imparare: senza e con accento",
          cards: [
            { front: "da / dà", back: "da è preposizione (vengo da Roma); dà è il verbo dare (lei dà un consiglio)." },
            { front: "e / è", back: "e è congiunzione (pane e latte); è è il verbo essere (è tardi)." },
            { front: "la / là", back: "la è articolo o pronome (la casa); là è avverbio di luogo (vai là)." },
            { front: "li / lì", back: "li è pronome (li vedo); lì è avverbio di luogo (sto lì)." },
            { front: "ne / né", back: "ne è pronome o avverbio (ne voglio due); né è congiunzione negativa (né io né te)." },
            { front: "se / sé", back: "se è congiunzione (se vuoi); sé è pronome riflessivo (parla di sé)." },
            { front: "si / sì", back: "si è pronome (si lava); sì è l'affermazione (sì, certo)." },
            { front: "te / tè", back: "te è pronome (per te); tè è la bevanda." },
            { front: "di / dì", back: "di è preposizione (di legno); dì è «giorno» (buon dì) e imperativo di dire." },
          ],
        },
        {
          t: "fill",
          title: "Accento o no?",
          items: [
            { before: "Mi", after: "un consiglio?", options: ["da", "dà"], answer: 1, why: "È il verbo dare: dà." },
            { before: "Vengo", after: "Verona.", options: ["da", "dà"], answer: 0, why: "Preposizione di provenienza: da." },
            { before: "Ho comprato pane", after: "latte.", options: ["e", "è"], answer: 0, why: "Congiunzione: e. Prova: puoi sostituire con «ed»?" },
            { before: "Ormai", after: "tardi.", options: ["e", "è"], answer: 1, why: "Verbo essere: è. Prova: puoi dire «era»?" },
            { before: "Non voglio", after: "caffè", options: ["ne", "né"], answer: 1, why: "Con «né … né» si nega due volte." },
            { before: "Dimmi", after: "vuoi che io ti aiuti.", options: ["se", "sé"], answer: 0, why: "Congiunzione ipotetica: se." },
            { before: "Lui pensa solo a", after: ".", options: ["se", "sé"], answer: 1, why: "Pronome riflessivo: sé." },
            { before: "", after: ", lo so.", options: ["Si", "Sì"], answer: 1, why: "Affermazione: sì." },
          ],
        },
        {
          t: "flip",
          title: "Grave o acuto?",
          cards: [
            { front: "Acuto ´ (suono chiuso)", back: "Si scrive su -ché: perché, poiché, benché, affinché, finché; e su né, sé, ventitré, viceré, poté, ripeté." },
            { front: "Grave ` (suono aperto)", back: "Si scrive su è, cioè, caffè, tè, bebè, gilè, ahimè, ohimè, a piè di pagina. Sulle altre vocali si usa sempre il grave: città, più, così, già, là." },
          ],
        },
        { t: "note", title: "L'accento non è un apostrofo", text: "Si scrive perché, non perchè né perche'. Sulla tastiera usa il carattere giusto: nel dubbio, fai la prova con la pronuncia (chiusa o aperta) e con l'elenco di parole che finiscono in -ché." },
        {
          t: "mark",
          title: "Cerca l'errore di accento",
          prompt: "Tocca le parole scritte in modo SBAGLIATO.",
          words: ["perchè", "città", "qui", "così", "ventitre", "più", "ciò", "gia"],
          correct: [0, 4, 7],
          why: "Si scrive perché (acuto), ventitré (acuto) e già (monosillabo con due vocali: vuole l'accento).",
        },
      ],
    },
    {
      title: "L'apostrofo",
      text: "Elisione e troncamento: la prova per distinguerli.",
      blocks: [
        { t: "p", text: "L'apostrofo segna la caduta di una vocale (o di una sillaba) alla fine di una parola. Ci sono due fenomeni diversi, e distinguerli è il segreto." },
        {
          t: "flip",
          title: "Elisione e troncamento",
          cards: [
            { front: "Elisione", back: "Cade la vocale finale davanti a un'altra vocale e si mette l'apostrofo: l'albero (lo albero), un'amica (una amica), dell'anno." },
            { front: "Troncamento", back: "Cade una vocale o una sillaba, ma la parola si può usare anche davanti a consonante: un cane, buon giorno, qual buon vento. Di solito NON vuole l'apostrofo." },
          ],
        },
        { t: "note", title: "La prova", text: "Se la forma tronca funziona anche davanti a una parola che inizia per consonante, è un troncamento e non vuole l'apostrofo: un cane, un amico, buon anno, qual è, nessun altro. Davanti ai nomi femminili l'elisione vuole l'apostrofo: un'amica, un'altra." },
        {
          t: "flip",
          title: "I casi particolari",
          cards: [
            { front: "un po'", back: "È un troncamento di «poco» e, eccezionalmente, vuole l'apostrofo: un po' di pane, non «un pò»." },
            { front: "Gli imperativi: da', di', fa', sta', va'", back: "Hanno l'apostrofo: da' (dai!), di' (dì!), fa', sta', va'. Non si scrive «stà», «fà», «và»." },
            { front: "c'è / ce", back: "c'è è «ci è» (c'è un problema); ce è un pronome (ce l'ho)." },
            { front: "c'entra / centra", back: "c'entra è «ci entra» (non c'entra); centra è «colpisce il centro»." },
            { front: "l'hanno / l'anno", back: "l'hanno è «lo hanno» (l'hanno visto); l'anno è il periodo di dodici mesi." },
            { front: "n'è / ne", back: "n'è è «ne è» (se n'è andato); ne è un pronome (ne voglio due)." },
          ],
        },
        {
          t: "fill",
          title: "Apostrofo sì o no?",
          items: [
            { before: "Ho incontrato", after: "mia amica.", options: ["un'", "un"], answer: 0, why: "Amica è femminile: un'amica, con elisione e apostrofo." },
            { before: "Ho incontrato", after: "mio amico.", options: ["un'", "un"], answer: 1, why: "Amico è maschile: un amico, troncamento, senza apostrofo." },
            { before: "", after: "è la tua età?", options: ["Qual", "Qual'", "Quale"], answer: 0, why: "Troncamento: qual è, mai qual'è." },
            { before: "Dammi", after: "di pane.", options: ["un po'", "un pò", "un po"], answer: 0, why: "Troncamento che vuole l'apostrofo: un po'." },
            { before: "Questa sera", after: "a casa a studiare.", options: ["sta'", "stà", "sta"], answer: 2, why: "Qui è indicativo (lei sta): senza apostrofo né accento. «Sta'» con l'apostrofo è solo l'imperativo (Sta' attento!)." },
            { before: "Non", after: "niente da fare.", options: ["c'è", "ce", "cè"], answer: 0, why: "«c'è» = «ci è»." },
          ],
        },
      ],
    },
    {
      title: "La lettera H",
      text: "Quattro compiti e una prova infallibile.",
      blocks: [
        { t: "p", text: "La h non si pronuncia mai: serve a distinguere parole uguali e a indurire c e g. Nel verbo avere compare in quattro forme: ho, hai, ha, hanno." },
        {
          t: "flip",
          title: "Le coppie con la h",
          cards: [
            { front: "ho / o", back: "ho è il verbo avere (ho fame); o è la congiunzione (tè o caffè)." },
            { front: "hai / ai", back: "hai è il verbo (hai ragione); ai è la preposizione articolata (ai ragazzi)." },
            { front: "ha / a", back: "ha è il verbo (lui ha vinto); a è la preposizione (vado a scuola)." },
            { front: "hanno / anno", back: "hanno è il verbo (loro hanno studiato); anno è il periodo (un anno)." },
          ],
        },
        { t: "note", title: "La prova dell'«aveva»", text: "Per capire se serve la h, prova a sostituire con «aveva/avevano»: se la frase regge, è il verbo avere e vuole la h. «Lui ha vinto» → «Lui aveva vinto»: sì. «Vado a scuola» → «Vado aveva scuola»: no, quindi senza h." },
        {
          t: "fill",
          title: "Con la h o senza?",
          items: [
            { before: "Lui", after: "finito i compiti.", options: ["ha", "a"], answer: 0, why: "«Lui aveva finito»: è il verbo avere." },
            { before: "Vado", after: "scuola in bicicletta.", options: ["ha", "a"], answer: 1, why: "«Vado aveva scuola» non ha senso: preposizione." },
            { before: "Loro", after: "capito la regola.", options: ["hanno", "anno"], answer: 0, why: "Verbo avere." },
            { before: "Tra un", after: "andrò all'università.", options: ["hanno", "anno"], answer: 1, why: "Periodo di dodici mesi." },
            { before: "Vuoi il tè", after: "il caffè?", options: ["ho", "o"], answer: 1, why: "Congiunzione che offre una scelta." },
            { before: "", after: "fame e sete.", options: ["Ho", "O"], answer: 0, why: "Verbo avere." },
          ],
        },
        {
          t: "flip",
          title: "Altri compiti della h",
          cards: [
            { front: "Esclamazioni", back: "ah, oh, eh, ehi, ahi, boh, mah: la h in fine o in mezzo segna l'esclamazione." },
            { front: "La h che indurisce", back: "chiesa, chilo, ghiro, laghi, amiche: serve a mantenere duro il suono di c e g davanti a e, i." },
            { front: "Parole straniere", back: "hotel, hobby, hardware, habitat: la h resta nella scrittura, ma non si pronuncia." },
          ],
        },
        { t: "h", text: "Altre trappole frequenti" },
        {
          t: "flip",
          title: "Piccoli dubbi, brevi regole",
          cards: [
            { front: "cu o qu?", back: "quadro, liquido; cuore, scuola, cuoco; acqua, acquisto, nacque (cqu). L'eccezione è soqquadro." },
            { front: "sce o scie?", back: "scena, pesce, conoscenza si scrivono senza i; scienza e coscienza la vogliono." },
            { front: "-cie o -ce?", back: "camicia → camicie (la i resta dopo vocale); provincia → province (cade dopo consonante)." },
            { front: "Una sola o due?", back: "Quando non sei sicuro, pronuncia la parola lentamente e controlla sul dizionario. Nel Nord le doppie si sentono poco." },
          ],
        },
      ],
    },
    {
      title: "Le maiuscole",
      text: "Quando sì, quando no, quando cambiano il significato.",
      blocks: [
        { t: "p", text: "La maiuscola serve a segnalare l'inizio di una frase e a distinguere i nomi propri. La scrittura usa due serie di lettere (maiuscole e minuscole): in tipografia si chiamano cassa alta e cassa bassa. In molti casi la maiuscola è obbligatoria, in molti altri è un errore." },
        {
          t: "flip",
          title: "Sì, la maiuscola è obbligatoria",
          cards: [
            { front: "Inizio di testo e dopo . ? !", back: "Il testo comincia con la maiuscola e si riparte con la maiuscola dopo punto, punto interrogativo, punto esclamativo e puntini che chiudono una frase." },
            { front: "Nomi propri", back: "Di persone (Roma, Carlo Magno), di luoghi, di popoli, di opere, di enti." },
            { front: "Titoli", back: "Nei titoli di libri e film si scrive maiuscola soltanto la prima parola: «Il barone rampante», non «Il Barone Rampante»." },
            { front: "Discorso diretto", back: "La battuta comincia con la maiuscola: Disse: «Arrivo subito»." },
          ],
        },
        {
          t: "sort",
          title: "Maiuscola o minuscola?",
          hint: "Scegli come va scritta la parola in evidenza.",
          buckets: ["Maiuscola", "Minuscola"],
          items: [
            { text: "Roma", bucket: 0, why: "Nome proprio di città." },
            { text: "lunedì", bucket: 1, why: "I giorni della settimana vogliono la minuscola." },
            { text: "ottobre", bucket: 1, why: "I mesi vogliono la minuscola." },
            { text: "Carlo Magno", bucket: 0, why: "Nome proprio di persona." },
            { text: "matematica", bucket: 1, why: "Le materie scolastiche vogliono la minuscola." },
            { text: "il professor Rossi", bucket: 1, why: "Il titolo davanti al nome resta minuscolo: professor Rossi." },
            { text: "Italia", bucket: 0, why: "Nome proprio di Stato." },
            { text: "francese (la lingua)", bucket: 1, why: "Lingue e nazionalità, come aggettivi o nomi comuni, vogliono la minuscola." },
          ],
        },
        {
          t: "flip",
          title: "La stessa parola, due scritture, due significati",
          cards: [
            { front: "Stato / stato", back: "Stato (maiuscolo) è l'istituzione politica; stato è il participio di essere." },
            { front: "Chiesa / chiesa", back: "Chiesa (maiuscolo) è l'istituzione religiosa; chiesa è l'edificio." },
            { front: "Terra / terra", back: "Terra è il pianeta; terra è il suolo." },
            { front: "Nord / nord", back: "Nord indica una regione o una zona (il Nord Italia); nord è il punto cardinale." },
          ],
        },
        {
          t: "flip",
          title: "La maiuscola nelle scienze",
          cards: [
            { front: "m / M", back: "5 mm è cinque millimetri; 5 Mm è cinque megametri: la maiuscola cambia di un milione di volte." },
            { front: "k / K", back: "2 kg sono due chili; 300 K sono trecento kelvin." },
            { front: "g / G", back: "2 g sono due grammi; 2 GB sono due gigabyte." },
            { front: "Co / CO", back: "Co è il cobalto; CO è il monossido di carbonio." },
          ],
        },
      ],
    },
    {
      title: "Sintesi: otto errori da non fare più",
      text: "Ripasso finale con tutte le regole.",
      blocks: [
        {
          t: "sort",
          title: "Qual è la forma corretta?",
          buckets: ["Corretta", "Sbagliata"],
          items: [
            { text: "qual è", bucket: 0, why: "Troncamento: senza apostrofo." },
            { text: "qual'è", bucket: 1, why: "Errore classico: qual è, senza apostrofo." },
            { text: "un po'", bucket: 0, why: "Troncamento con apostrofo." },
            { text: "un pò", bucket: 1, why: "Si scrive un po' con l'apostrofo." },
            { text: "un amico", bucket: 0, why: "Troncamento davanti a nome maschile: senza apostrofo." },
            { text: "un'amico", bucket: 1, why: "Con il maschile l'apostrofo non serve." },
            { text: "perché", bucket: 0, why: "Accento acuto: -ché." },
            { text: "perchè", bucket: 1, why: "Si scrive perché." },
            { text: "a giugno", bucket: 0, why: "Mese con la minuscola." },
            { text: "a Giugno", bucket: 1, why: "I mesi non vogliono la maiuscola." },
            { text: "sta, fa, va", bucket: 0, why: "Senza accento né apostrofo." },
            { text: "stà, fà, và", bucket: 1, why: "Le forme del presente non vogliono l'accento." },
            { text: "È tardi.", bucket: 0, why: "Maiuscola con accento: È." },
            { text: "E tardi.", bucket: 1, why: "Il verbo essere vuole l'accento anche in maiuscolo: È." },
            { text: "Gli ha detto.", bucket: 0, why: "Con la h del verbo avere." },
            { text: "Gli a detto.", bucket: 1, why: "Manca la h: prova «aveva»." },
          ],
        },
        {
          t: "mark",
          title: "Caccia all'errore",
          prompt: "Tocca le frasi con un errore di ortografia.",
          words: [
            "Non ho fame, perchè ho mangiato.",
            "Marta è andata a Verona con la sorella.",
            "Un'amica mi ha prestato il libro.",
            "Gli anno regalato un libro.",
            "Il compito è per lunedì.",
            "Dammi un pò di tempo.",
          ],
          correct: [0, 3, 5],
          why: "perchè → perché; anno → hanno; pò → po'.",
        },
        { t: "quiz", question: "Quale prova usi per decidere se «a / ha» vuole la h?", options: ["La prova dell'«aveva»", "La prova dell'elisione", "La lettura al contrario", "Nessuna: bisogna impararle a memoria"], answer: 0, why: "Se puoi dire «aveva» al suo posto è il verbo avere e vuole la h." },
        { t: "reveal", prompt: "Perché l'ortografia è anche una forma di rispetto per chi legge?", answer: "Perché un testo scritto bene si capisce alla prima lettura, mentre un errore costringe il lettore a fermarsi, tornare indietro, a volte a interpretare male. Scrivere giusto significa non far perdere tempo a chi legge." },
      ],
    },
  ],
);

const parti = make(
  "ita-parti-discorso",
  "Le nove parti del discorso",
  "Come si classificano le parole dell'italiano: cinque variabili, quattro invariabili, e il procedimento a domande per riconoscerle nella frase.",
  [
    {
      title: "Classificare le parole",
      text: "Più di centomila parole in un vocabolario: come si mettono in ordine?",
      blocks: [
        { t: "p", text: "Ogni scienza mette ordine classificando: si mettono insieme le cose che si comportano allo stesso modo. La biologia classifica i viventi in specie, generi, famiglie; la chimica ordina gli elementi nella tavola periodica; la grammatica divide le parole in parti del discorso." },
        {
          t: "steps",
          title: "Nove classi per tutte le parole dell'italiano",
          items: [
            { title: "Cinque parti variabili", text: "Nome (indica persone, cose, idee), articolo (precede il nome e lo determina), aggettivo (aggiunge una qualità), pronome (sta al posto di un nome), verbo (dice che cosa accade). Cambiano la parte finale." },
            { title: "Quattro parti invariabili", text: "Avverbio, preposizione, congiunzione, interiezione. Hanno una forma sola, sempre uguale: non si accordano con nessun'altra parola." },
          ],
        },
        { t: "h", text: "Due domande per classificare una parola" },
        {
          t: "flip",
          title: "Forma e funzione",
          cards: [
            { front: "Che forma ha?", back: "Cambia la parte finale oppure resta sempre uguale? Se cambia, è variabile; se no, è invariabile." },
            { front: "Che cosa fa?", back: "Nomina, descrive, sostituisce, dice che cosa accade, collega? Dalla funzione capiamo la classe." },
          ],
        },
        { t: "p", text: "Le parole variabili hanno una radice (resta fissa e porta il significato) e una desinenza (cambia e porta le informazioni grammaticali). La desinenza dice il genere (ragazzo / ragazza: maschile o femminile), il numero (libro / libri: singolare o plurale), la persona (parlo / parli: io, tu, lei…) e, solo nel verbo, il tempo e il modo (parlavo / parlerò)." },
        {
          t: "sort",
          title: "Variabile o invariabile?",
          buckets: ["Variabile", "Invariabile"],
          items: [
            { text: "gatto / gatta", bucket: 0, why: "La desinenza cambia: genere." },
            { text: "sempre", bucket: 1, why: "Avverbio: una forma sola." },
            { text: "parlo / parli", bucket: 0, why: "Verbo: cambia la persona." },
            { text: "con", bucket: 1, why: "Preposizione: sempre uguale." },
            { text: "perché", bucket: 1, why: "Congiunzione: forma fissa." },
            { text: "ehi", bucket: 1, why: "Interiezione: sempre uguale." },
            { text: "nuovo / nuova / nuovi", bucket: 0, why: "Aggettivo: si accorda." },
          ],
        },
        { t: "note", title: "Una frase sola, nove parti del discorso", text: "Ah, il nuovo robot funziona benissimo, ma lo ricarichiamo in laboratorio. Undici parole, nove colori: interiezione (Ah), articolo (il), aggettivo (nuovo), nome (robot), verbo (funziona), avverbio (benissimo), congiunzione (ma), pronome (lo), verbo (ricarichiamo), preposizione (in), nome (laboratorio). Nessuna classe resta fuori." },
      ],
    },
    {
      title: "Le cinque parti variabili",
      text: "Nome, articolo, aggettivo, pronome, verbo.",
      blocks: [
        {
          t: "flip",
          title: "Le cinque classi con la loro prova",
          cards: [
            { front: "Il nome", back: "Indica persone, animali, cose, luoghi, idee, sentimenti (Marta, lupo, tavolo, Verona, libertà). La prova: può avere davanti un articolo: il lupo, una paura, la libertà." },
            { front: "L'articolo", back: "Precede il nome e ne segnala genere e numero. Determina: «Ho visto il cane» è quello che conosciamo; «Ho visto un cane» è uno qualsiasi. La prova: sta sempre davanti a un nome." },
            { front: "L'aggettivo", back: "Si aggiunge a un nome per indicarne una qualità o precisarlo (alto, veloce, mio, questo, alcuni, tre). La prova: non sta mai da solo e si accorda: un quaderno nuovo, una penna nuova." },
            { front: "Il pronome", back: "Sta al posto di un nome ed evita le ripetizioni (io, lo, quello, nessuno, che, chi?). Esempio: Ho incontrato Luca e l'ho salutato. La prova: sostituisce un nome." },
            { front: "Il verbo", back: "Dice che cosa accade: un'azione, uno stato, un evento (correre, essere, nevicare). La prova: si coniuga: oggi corro, ieri correvo, domani correremo." },
          ],
        },
        {
          t: "flip",
          title: "Tre modi per classificare un nome",
          cards: [
            { front: "Il significato", back: "Comune o proprio; concreto o astratto; individuale o collettivo." },
            { front: "La forma", back: "Maschile o femminile; singolare o plurale. Ogni nome ha un genere e può variare nel numero." },
            { front: "La struttura", back: "Primitivo (libro), derivato (libreria), alterato (libretto), composto (segnalibro)." },
          ],
        },
        {
          t: "flip",
          title: "Tre tipi di articolo e sei tipi di aggettivo",
          cards: [
            { front: "Articoli", back: "Determinativo (il, lo, la, l', i, gli, le): qualcosa di noto. Indeterminativo (un, uno, una, un'): qualcosa di generico. Partitivo (del, dello, della, dei, degli, delle): una quantità non precisata. Lo e uno si usano davanti a s + consonante, z, gn, ps, x, y." },
            { front: "Qualificativo, possessivo, dimostrativo", back: "Qualificativo (alto, veloce, rosso; ha tre gradi: alto, più alto, altissimo); possessivo (mio, tuo, nostro); dimostrativo (questo, quello)." },
            { front: "Indefinito, numerale, interrogativo", back: "Indefinito (alcuni, ogni, nessuno); numerale (tre, dieci, primo); interrogativo (quale?, che?, quanto?)." },
          ],
        },
        {
          t: "flip",
          title: "Aggettivo o pronome? Dipende da che cosa fa",
          cards: [
            { front: "Questo libro è mio.", back: "«Questo» accompagna il nome «libro»: aggettivo dimostrativo." },
            { front: "Quello è tuo.", back: "«Quello» prende il posto di «quel libro»: pronome dimostrativo." },
            { front: "Molti studenti hanno risposto.", back: "«Molti» accompagna «studenti»: aggettivo indefinito." },
            { front: "Alcuni hanno sbagliato.", back: "«Alcuni» sta per «alcuni studenti»: pronome indefinito." },
          ],
        },
        {
          t: "steps",
          title: "Una forma verbale, quattro informazioni",
          items: [
            { title: "Persona e numero", text: "Prima, seconda o terza; singolare o plurale. In «parleremo»: prima persona plurale, chi parla (noi)." },
            { title: "Tempo", text: "In «parleremo»: futuro, non è ancora accaduto. Soltanto il verbo colloca ciò che dice nel tempo." },
            { title: "Modo", text: "Tre coniugazioni (-are, -ere, -ire) e sette modi: indicativo, congiuntivo, condizionale, imperativo (modi finiti, indicano la persona); infinito, participio, gerundio (modi indefiniti)." },
            { title: "Ausiliari", text: "Essere e avere servono per formare i tempi composti." },
          ],
        },
        {
          t: "mark",
          title: "Ora tocca a te",
          prompt: "Oh, la nostra gatta dorme spesso sul divano e lo graffia. Tocca le parole che possono cambiare forma (le variabili).",
          words: ["Oh", "la", "nostra", "gatta", "dorme", "spesso", "sul", "divano", "e", "lo", "graffia"],
          correct: [1, 2, 3, 4, 7, 9, 10],
          why: "Variabili: la (articolo), nostra (aggettivo), gatta (nome), dorme (verbo), divano (nome), lo (pronome), graffia (verbo). Invariabili: oh (interiezione), spesso (avverbio), sul (preposizione), e (congiunzione). «Lo» non è un articolo: sta al posto di «il divano».",
        },
      ],
    },
    {
      title: "Le quattro parti invariabili",
      text: "Avverbio, preposizione, congiunzione, interiezione: una forma sola.",
      blocks: [
        {
          t: "flip",
          title: "Le quattro classi con la loro prova",
          cards: [
            { front: "L'avverbio", back: "Precisa il significato di un verbo, di un aggettivo, di un altro avverbio (bene, qui, ieri, molto, forse). La prova: non si accorda: Luca corre molto, Anna corre molto, loro corrono molto." },
            { front: "La preposizione", back: "Collega due parole e stabilisce un rapporto fra loro (di, a, da, in, con, su, per, tra). La prova: è sempre seguita dalla parola che introduce: il libro di Sara, vado a scuola." },
            { front: "La congiunzione", back: "Unisce due parole della stessa frase oppure due frasi (e, o, ma, però, perché, se, quando). Pane e acqua. Esco perché ho finito." },
            { front: "L'interiezione", back: "Esprime un'emozione o una reazione: da sola vale una frase (ah, ehi, uffa, boh, bravo!). L'acca segue la vocale: ah, oh, ehi. «Ha» e «ho» sono voci del verbo avere." },
          ],
        },
        {
          t: "flip",
          title: "Sottotipi da conoscere",
          cards: [
            { front: "Avverbio: a quale domanda risponde", back: "Modo (come? bene, lentamente), tempo (quando? ieri, sempre, mai), luogo (dove? qui, lontano, fuori), quantità (quanto? molto, poco, troppo), giudizio (sì, no, forse), interrogativi (dove? come? perché?). Da un aggettivo si forma con -mente: lento → lentamente." },
            { front: "Preposizioni semplici, articolate, improprie", back: "Semplici: di, a, da, in, con, su, per, tra, fra. Articolate: di + il = del, a + la = alla, su + gli = sugli (cambia l'articolo, non la preposizione). Improprie: sopra, sotto, dopo, durante, senza." },
            { front: "Congiunzioni coordinanti e subordinanti", back: "Coordinanti (e, o, ma, però, quindi): mettono due elementi sullo stesso piano. Subordinanti (che, perché, se, quando): una frase dipende dall'altra. Studio e ascolto musica. Studio perché voglio capire." },
          ],
        },
        {
          t: "flip",
          title: "Avverbio o preposizione? Guarda che cosa segue",
          cards: [
            { front: "Il gatto è salito sopra.", back: "«Sopra» sta da solo e precisa il verbo: avverbio." },
            { front: "Il gatto è sopra il tetto.", back: "«Sopra» introduce «il tetto»: preposizione." },
            { front: "Ci vediamo dopo.", back: "«Dopo» sta da solo: avverbio." },
            { front: "Ci vediamo dopo la lezione.", back: "«Dopo» introduce «la lezione»: preposizione." },
          ],
        },
        {
          t: "sort",
          title: "Quale invariabile è?",
          buckets: ["Avverbio", "Preposizione", "Congiunzione", "Interiezione"],
          items: [
            { text: "lentamente", bucket: 0, why: "Risponde a «come?»." },
            { text: "con", bucket: 1, why: "Collega due parole." },
            { text: "perché", bucket: 2, why: "Unisce due frasi." },
            { text: "uffa", bucket: 3, why: "Esprime un'emozione." },
            { text: "ieri", bucket: 0, why: "Risponde a «quando?»." },
            { text: "però", bucket: 2, why: "Congiunzione coordinante." },
            { text: "tra", bucket: 1, why: "Preposizione semplice." },
            { text: "boh", bucket: 3, why: "Interiezione." },
          ],
        },
      ],
    },
    {
      title: "Riconoscerle nella frase",
      text: "Una parola non si classifica mai da sola, ma dentro la frase in cui si trova.",
      blocks: [
        { t: "note", title: "La domanda giusta", text: "Non è «che cos'è questa parola?», ma «che cosa fa qui?». Per questo il vocabolario non basta: la stessa parola può stare in classi diverse." },
        {
          t: "sort",
          title: "«La»: una parola, tre classi",
          buckets: ["Articolo", "Pronome", "Nome"],
          items: [
            { text: "La casa è grande.", bucket: 0, why: "Precede il nome «casa»." },
            { text: "La apro io.", bucket: 1, why: "Sta al posto di «la porta»." },
            { text: "Dammi il la.", bucket: 2, why: "Indica una nota musicale: con l'articolo davanti diventa un nome." },
          ],
        },
        {
          t: "sort",
          title: "«Che»: pronome, congiunzione, aggettivo",
          hint: "Se si può sostituire con «il quale, la quale», è un pronome relativo.",
          buckets: ["Pronome relativo", "Congiunzione", "Aggettivo interrogativo"],
          items: [
            { text: "Il film che ho visto è lungo.", bucket: 0, why: "Sta al posto di «il film»." },
            { text: "Penso che tu abbia ragione.", bucket: 1, why: "Unisce due frasi." },
            { text: "Che libro stai leggendo?", bucket: 2, why: "Accompagna «libro»." },
          ],
        },
        {
          t: "sort",
          title: "«Molto»: aggettivo, pronome, avverbio",
          hint: "Se precisa un aggettivo o un verbo e resta invariato, è un avverbio.",
          buckets: ["Aggettivo", "Pronome", "Avverbio"],
          items: [
            { text: "C'è molto traffico.", bucket: 0, why: "Accompagna «traffico» e si accorda." },
            { text: "Molti sono già partiti.", bucket: 1, why: "Sta per «molte persone»." },
            { text: "Sono molto stanchi.", bucket: 2, why: "Precisa «stanchi» e non si accorda." },
          ],
        },
        {
          t: "flip",
          title: "Con l'articolo davanti, tutto diventa nome",
          cards: [
            { front: "il bello", back: "Era un aggettivo: ora è un nome." },
            { front: "il perché", back: "Era una congiunzione: ora è un nome." },
            { front: "il domani", back: "Era un avverbio: ora è un nome." },
            { front: "un sì", back: "Era un avverbio: ora è un nome." },
            { front: "il sapere", back: "Era un verbo: ora è un nome." },
          ],
        },
        {
          t: "steps",
          title: "Un procedimento a domande, come un algoritmo",
          items: [
            { title: "La parola cambia forma?", text: "Sì → è variabile (vai al passo 2). No → è invariabile (vai al passo 3)." },
            { title: "Variabile: che cosa fa?", text: "Si coniuga e indica un tempo → verbo. Sta davanti al nome e lo determina → articolo. Accompagna il nome → aggettivo. Sta al posto di un nome → pronome. Indica persone, cose, idee → nome." },
            { title: "Invariabile: che cosa fa?", text: "Introduce una parola e la collega → preposizione. Unisce due parole o due frasi → congiunzione. Precisa un verbo o un aggettivo → avverbio. Esprime un'emozione e vale una frase → interiezione." },
          ],
        },
        { t: "h", text: "L'analisi grammaticale in tre passi" },
        { t: "p", text: "Primo passo: la parte del discorso. Secondo passo: il tipo (comune o proprio, determinativo o indeterminativo, qualificativo o possessivo). Terzo passo: la forma (genere e numero; per il verbo anche modo, tempo, persona). Esempio con la frase del robot: il → articolo determinativo; robot → nome comune di cosa; funziona → verbo, 1ª coniugazione, indicativo presente, 3ª persona singolare; benissimo → avverbio di modo, superlativo; lo → pronome personale, complemento." },
        {
          t: "sort",
          title: "Analisi grammaticale: Domani i miei compagni presenteranno un progetto interessante e noi li ascolteremo con attenzione.",
          hint: "Quattordici parole: a quale classe appartiene ciascuna?",
          buckets: ["Nome", "Articolo", "Aggettivo", "Pronome", "Verbo", "Avverbio", "Preposizione", "Congiunzione", "Interiezione"],
          items: [
            { text: "Domani", bucket: 5, why: "Avverbio di tempo." },
            { text: "i", bucket: 1, why: "Articolo determinativo." },
            { text: "miei", bucket: 2, why: "Aggettivo possessivo." },
            { text: "compagni", bucket: 0, why: "Nome comune di persona." },
            { text: "presenteranno", bucket: 4, why: "Verbo, futuro." },
            { text: "un", bucket: 1, why: "Articolo indeterminativo." },
            { text: "progetto", bucket: 0, why: "Nome comune di cosa." },
            { text: "interessante", bucket: 2, why: "Aggettivo qualificativo." },
            { text: "e", bucket: 7, why: "Congiunzione coordinante." },
            { text: "noi", bucket: 3, why: "Pronome personale soggetto." },
            { text: "li", bucket: 3, why: "Pronome personale complemento: sta per «i compagni»." },
            { text: "ascolteremo", bucket: 4, why: "Verbo, futuro." },
            { text: "con", bucket: 6, why: "Preposizione semplice." },
            { text: "attenzione", bucket: 0, why: "Nome comune astratto." },
          ],
        },
        { t: "reveal", prompt: "Quale classe manca nella frase del progetto?", answer: "L'interiezione: quattordici parole, otto classi su nove." },
        { t: "reveal", prompt: "A che cosa serve sapere in quale classe sta una parola?", answer: "Serve a capire come funziona la frase: chi fa che cosa, come si accordano le parole, dove mettere la punteggiatura, come scegliere l'ortografia (ha / a, che cosa è un nome o un verbo). Ed è la base per studiare ogni lingua e, per una classe STEAM, per capire anche come un computer legge un codice." },
        {
          t: "steps",
          title: "Tre idee da portare a casa",
          items: [
            { title: "Forma e funzione", text: "Le parole si classificano per come cambiano e per ciò che fanno." },
            { title: "Sempre dentro la frase", text: "La stessa parola può stare in classi diverse." },
            { title: "Tre passi", text: "Parte del discorso, tipo, forma." },
          ],
        },
      ],
    },
  ],
);

const rubrica = (cd: string[]): Part => ({
  title: "Rileggere e farsi valutare",
  text: "L'ultimo controllo e la griglia con cui sarà valutato il testo.",
  blocks: [
    {
      t: "flip",
      title: "Rileggi con la matita in mano: tre controlli",
      cards: [
        { front: "Ortografia", back: "Accenti (è verbo e e congiunzione; perché, più, già, così, città). Apostrofi (un amico ma un'amica; qual è senza apostrofo; po'). La h nel verbo avere (ho, hai, ha, hanno); doppie e maiuscole." },
        { front: "Punteggiatura", back: "Un punto alla fine di ogni frase; virgole negli elenchi; nessuna virgola tra soggetto e verbo; virgolette del discorso diretto aperte e chiuse." },
        { front: "Frasi", back: "Ogni frase ha il suo verbo; periodi non troppo lunghi; concordanze (soggetto e verbo, nome e aggettivo); tempi verbali coerenti dall'inizio alla fine." },
        { front: "Il mio testo", back: cd.join(" ") },
      ],
    },
    {
      t: "flip",
      title: "Come sarà valutato il testo: quattro indicatori da 2,5 punti",
      cards: [
        { front: "A · Ortografia e punteggiatura", back: "Uso corretto di accenti, apostrofi, doppie, maiuscole, h; punteggiatura che rende chiaro il senso delle frasi, anche nel discorso diretto." },
        { front: "B · Morfologia, sintassi e lessico", back: "Concordanze, tempi e modi verbali, costruzione dei periodi; lessico preciso, vario e adatto al tipo di testo." },
        { front: "C · Contenuto e aderenza alla traccia", back: "Si valuta se il testo rispetta la traccia scelta e i suoi vincoli, e se il contenuto è coerente e ben scelto." },
        { front: "D · Organizzazione e tecniche", back: "Si valutano le tecniche del genere, la lunghezza rispettata e la revisione documentata nella scheda." },
        { front: "Come si calcola il voto", back: "Livelli per ogni indicatore: 2,5 ottimo · 2 buono · 1,5 sufficiente · 1 insufficiente · 0,5 gravemente insufficiente · 0,25 non svolto. Voto in decimi = A + B + C + D. Forma = A + B su 5; contenuto = C + D su 5." },
      ],
    },
    {
      t: "reveal",
      prompt: "Che cosa si consegna e in quale ordine?",
      answer: "Bella copia, brutta copia con le correzioni, scheda compilata, in quest'ordine.",
    },
  ],
});

const scritturaLuogo = make(
  "ita-scrittura-luogo",
  "Laboratorio di scrittura 1: descrivere un luogo",
  "Il decalogo del testo descrittivo, le due tracce, l'anatomia di un esempio commentato e gli interventi di revisione sulla brutta copia.",
  [
    {
      title: "Il decalogo del testo descrittivo",
      text: "Descrivere bene significa scegliere: che cosa mostrare, in quale ordine, con quali parole.",
      blocks: [
        { t: "p", text: "Descrivere significa far vedere con le parole. Chi legge non è mai stato nel tuo luogo: alla fine del testo deve poterci entrare, orientarsi e capire perché quel luogo conta. Dieci regole valgono per ogni descrizione: di un luogo, di un oggetto, di un paesaggio, di un animale." },
        {
          t: "flip",
          title: "Dieci regole: tocca le carte",
          cards: [
            { front: "1 · Chiediti a che cosa serve", back: "Una descrizione può informare (come in una guida) oppure trasmettere un'emozione (come in un racconto). Nel primo caso è oggettiva, nel secondo soggettiva: decidilo prima di scrivere la prima parola." },
            { front: "2 · Scegli da dove guardi", back: "Stabilisci il punto di osservazione: da fermo o in movimento, da vicino o da lontano, con gli occhi di chi entra per la prima volta o di chi conosce ogni angolo. Poi non cambiarlo a metà." },
            { front: "3 · Osserva più di quanto scriverai", back: "Raccogli molti dettagli, anche quelli che sembrano inutili: si può scegliere soltanto quando si ha qualcosa tra cui scegliere." },
            { front: "4 · Seleziona", back: "Una descrizione non è un inventario. Tieni i dettagli che costruiscono l'impressione d'insieme e lascia fuori il resto: se un particolare c'è, deve avere una funzione." },
            { front: "5 · Metti ordine", back: "Segui un criterio e mantienilo: spaziale (da sinistra a destra, dal vicino al lontano, dal basso verso l'alto), dal generale al particolare, oppure in ordine d'importanza." },
            { front: "6 · Usa tutti i sensi", back: "Vista, udito, olfatto, tatto e, quando ha senso, gusto. Un suono o un odore fanno «entrare» il lettore più di dieci oggetti elencati." },
            { front: "7 · Chiama le cose con il loro nome", back: "Evita cosa, roba, oggetto, coso. Non «un albero», ma «un platano»; non «una sedia vecchia», ma «una sedia impagliata, con la paglia sfilacciata»." },
            { front: "8 · Pochi aggettivi, ma giusti", back: "Un aggettivo deve aggiungere un'informazione: bello e grande non ne aggiungono. Similitudini e metafore aiutano a vedere, ma vanno usate con misura." },
            { front: "9 · Collega e mantieni il tempo", back: "Gli indicatori spaziali (accanto, di fronte, sullo sfondo, in fondo a) legano le frasi. Scegli un tempo verbale, il presente o l'imperfetto, e mantienilo per tutto il testo." },
            { front: "10 · Apri e chiudi", back: "L'inizio colloca il lettore: dove siamo, che cosa vediamo per primo? La conclusione lascia un'impressione o un significato. Una descrizione non finisce perché sono finiti gli oggetti." },
          ],
        },
        {
          t: "sort",
          title: "Oggettiva o soggettiva?",
          buckets: ["Descrizione oggettiva", "Descrizione soggettiva"],
          items: [
            { text: "Una guida turistica che descrive la piazza", bucket: 0, why: "Informa: scopo oggettivo." },
            { text: "Una pagina di diario sulla cucina dei nonni", bucket: 1, why: "Trasmette un'emozione." },
            { text: "La scheda di un manuale su un laboratorio", bucket: 0, why: "Informa." },
            { text: "Un racconto che descrive una stanza buia", bucket: 1, why: "Trasmette un'atmosfera." },
          ],
        },
      ],
    },
    {
      title: "Le tracce e gli attrezzi",
      text: "Scegli una delle due tracce: 20-25 righe di foglio protocollo, con un titolo.",
      blocks: [
        {
          t: "flip",
          title: "Le due tracce",
          cards: [
            { front: "A · Un luogo che conosco a memoria", back: "Descrivi un luogo che frequenti spesso e a cui sei legato o legata: la tua stanza, la cucina dei nonni, la palestra in cui ti alleni, un angolo del tuo paese. Fai capire al lettore com'è e che cosa rappresenta per te. Descrizione soggettiva, in prima persona." },
            { front: "B · Un luogo, un momento", back: "Descrivi un luogo pubblico in un momento preciso della giornata: la fermata dell'autobus alle 7.30, il cortile della scuola durante l'intervallo, un supermercato il sabato pomeriggio, una piazza di sera. Fai vedere il luogo e le persone che lo animano, come farebbe una telecamera che si sposta lentamente. Descrizione più oggettiva; puoi usare il presente." },
          ],
        },
        {
          t: "flip",
          title: "Gli attrezzi del mestiere",
          cards: [
            { front: "Un ordine, e uno solo", back: "Scegli un percorso per lo sguardo e seguilo fino in fondo: dall'ingresso verso l'interno, da sinistra a destra, dal vicino al lontano, dal generale al particolare. Chi salta da un angolo all'altro disorienta il lettore." },
            { front: "Cinque sensi, non uno", back: "La vista non basta: un luogo ha suoni, odori, una temperatura, superfici ruvide o lisce. Due o tre dettagli sensoriali ben scelti valgono più di un lungo elenco di oggetti." },
            { front: "Le parole dello spazio", back: "Gli indicatori spaziali tengono insieme la descrizione: accanto a, di fronte, sullo sfondo, in fondo a, sopra, al centro, lungo la parete, oltre la finestra." },
            { front: "Il dettaglio preciso", back: "«Una lampada bella» non dice nulla; «una lampada di ottone, con il paralume storto» si vede. Preferisci nomi esatti e aggettivi che aggiungono un'informazione." },
            { front: "Immagini e confronti", back: "Una similitudine ben scelta (come, sembra, simile a) aiuta a vedere: «i vasetti in fila come soldatini». Ne bastano una o due." },
            { front: "Un'impressione d'insieme", back: "Ogni luogo lascia un'atmosfera: accogliente, caotica, malinconica, solenne. Decidila prima di scrivere e scegli i dettagli che la confermano, senza bisogno di dichiararla." },
          ],
        },
      ],
    },
    {
      title: "Anatomia di un esempio",
      text: "«La cucina della nonna»: i numeri indicano le tecniche usate.",
      blocks: [
        { t: "p", text: "La cucina di mia nonna è la prima porta a destra, in fondo a un corridoio che profuma di cera. Appena entri, ti accoglie il ticchettio di un orologio a muro con i numeri romani, appeso sopra la credenza da più di quarant'anni. Al centro c'è un tavolo di legno chiaro, segnato da graffi sottili e da un cerchio più scuro, lasciato chissà quando da una pentola troppo calda. La finestra guarda sul cortile: d'inverno i vetri si appannano e qualcuno ci disegna sempre una faccina con il dito. Sul davanzale stanno in fila, come soldatini, tre vasetti di basilico, rosmarino e salvia. Ma la cosa che riconoscerei a occhi chiusi è l'odore: un misto di caffè, di sugo che sobbolle piano e di sapone di Marsiglia. Lì dentro il tempo sembra andare più lento, e io, che a casa corro sempre, mi siedo e aspetto." },
        {
          t: "sort",
          title: "Che tecnica usa ogni frase?",
          buckets: ["Inizio", "Udito", "Indicatori spaziali", "Dettaglio preciso", "Similitudine", "Olfatto", "Conclusione"],
          items: [
            { text: "La cucina di mia nonna è la prima porta a destra, in fondo a un corridoio che profuma di cera.", bucket: 0, why: "Dice dove siamo e da dove entra lo sguardo." },
            { text: "Appena entri, ti accoglie il ticchettio di un orologio a muro", bucket: 1, why: "Il primo dettaglio non è visivo." },
            { text: "Al centro c'è un tavolo di legno chiaro", bucket: 2, why: "«Al centro», «sopra», «in fondo a»: guidano il percorso." },
            { text: "da un cerchio più scuro, lasciato chissà quando da una pentola troppo calda", bucket: 3, why: "Un oggetto con una storia." },
            { text: "in fila, come soldatini, tre vasetti di basilico", bucket: 4, why: "Un confronto che fa vedere." },
            { text: "Ma la cosa che riconoscerei a occhi chiusi è l'odore", bucket: 5, why: "L'odore come «firma» del luogo." },
            { text: "Lì dentro il tempo sembra andare più lento, e io, che a casa corro sempre, mi siedo e aspetto.", bucket: 6, why: "Dice che cosa significa il luogo per chi scrive." },
          ],
        },
      ],
    },
    {
      title: "Prima ora: progettare e scrivere",
      text: "Dalle idee alla brutta copia, un passo alla volta.",
      blocks: [
        {
          t: "seq",
          title: "Ordina le fasi della prima ora",
          items: [
            "Scegli il luogo e l'impressione che vuoi lasciare",
            "Raccogli i dettagli con tutti i sensi",
            "Scegli l'ordine dello sguardo",
            "Costruisci la scaletta: inizio, tre sviluppi, conclusione",
            "Scrivi la brutta copia, una riga sì e una no",
          ],
          why: "Le prime quattro fasi preparano: soltanto alla quinta si scrive. Lo spazio libero tra le righe servirà nella seconda ora per correggere.",
        },
        {
          t: "steps",
          title: "Le cinque fasi, nel dettaglio",
          items: [
            { title: "1 · Scegli il luogo", text: "Fissa tre decisioni: il luogo che descrivi, perché proprio questo, e l'impressione che vuoi lasciare (una o due parole)." },
            { title: "2 · Raccogli i dettagli", text: "Immagina di essere lì e annota tutto ciò che percepisci, con parole e gruppi di parole. Almeno tre dettagli per la vista, almeno uno per gli altri sensi, e il dettaglio unico: quello che solo tu hai notato." },
            { title: "3 · Scegli l'ordine", text: "Dall'ingresso verso l'interno, da sinistra a destra, dal vicino al lontano, dal generale al particolare, dal basso verso l'alto." },
            { title: "4 · Costruisci la scaletta", text: "Inizio (dove siamo, prima impressione), sviluppo 1, sviluppo 2, sviluppo 3 (o il dettaglio unico), conclusione (che cosa rappresenta il luogo, ultima immagine)." },
            { title: "5 · Scrivi la brutta copia", text: "Una riga sì e una no. Segui la scaletta e scrivi di seguito, senza fermarti su ogni parola: adesso conta far uscire le idee. Se un'idea nuova ti sembra migliore, usala." },
          ],
        },
      ],
    },
    {
      title: "Seconda ora: in officina",
      text: "Tre interventi mirati sulla brutta copia.",
      blocks: [
        { t: "p", text: "Prima di rivedere, rileggi tutta la brutta copia dall'inizio alla fine, senza correggere. Chiediti: un compagno che non ha mai visto il luogo riuscirebbe a disegnarne la pianta? Lo sguardo segue l'ordine scelto? Ho usato almeno tre sensi? L'impressione d'insieme si capisce senza che io la dichiari? La conclusione chiude davvero il testo? Dove la risposta è «no», intervieni." },
        {
          t: "fill",
          title: "a) Verbi più precisi",
          hint: "Sostituisci il verbo vuoto («c'è», «ha», «si trova») con uno che faccia vedere.",
          items: [
            { before: "«Sopra il letto c'è una mensola» →", after: "", options: ["Sopra il letto corre una mensola stretta, piegata dal peso dei libri", "Sopra il letto ha una mensola con dei libri", "Sopra il letto si trova una mensola"], answer: 0, why: "Il verbo «corre» e il dettaglio «piegata dal peso dei libri» fanno vedere." },
            { before: "«La stanza ha una finestra» →", after: "", options: ["Nella stanza si trova una finestra", "Una finestra si apre sul cortile e lascia entrare l'odore di pane", "La finestra c'è"], answer: 1, why: "Un verbo preciso e un dettaglio sensoriale." },
          ],
        },
        {
          t: "fill",
          title: "b) Aggettivi che dicono qualcosa",
          hint: "Sostituisci l'aggettivo vuoto con un dettaglio concreto.",
          items: [
            { before: "«una stanza grande» →", after: "", options: ["una stanza grandissima", "una stanza in cui la voce rimbomba", "una stanza bella e spaziosa"], answer: 1, why: "Dà un'informazione concreta, che si sente." },
            { before: "«un bel giardino» →", after: "", options: ["un giardino con le rose arrampicate sul muro", "un giardino molto bello", "un giardino carino"], answer: 0, why: "Nomina i dettagli invece di valutare." },
          ],
        },
        {
          t: "mark",
          title: "c) Via le parole vuote",
          prompt: "Nella frase «Nella stanza c'è un bel tavolo grande e una cosa carina sopra la roba» tocca le parole da sostituire.",
          words: ["c'è", "bel", "tavolo", "grande", "cosa", "carina", "roba"],
          correct: [0, 1, 3, 4, 5, 6],
          why: "«C'è» è un verbo vuoto; «bel», «grande», «carina» non aggiungono informazioni; «cosa» e «roba» sono parole generiche. «Tavolo» è un nome preciso e si tiene.",
        },
        {
          t: "fill",
          title: "d) Via le ripetizioni",
          items: [
            { before: "«Il cortile è grande. Il cortile è pieno di piante. Il cortile…» → meglio:", after: "", options: ["Il cortile è grande, è pieno di piante, e il cortile profuma.", "Il cortile è grande e pieno di piante; da lì sale un profumo di basilico.", "Il cortile, il cortile e il cortile."], answer: 1, why: "Si evita la ripetizione con una frase costruita in modo diverso." },
          ],
        },
        { t: "note", title: "La bella copia", text: "Ricopia il testo sul foglio protocollo con tutte le correzioni, senza saltare righe e con il titolo. Mentre ricopi puoi migliorare ancora: la bella copia non è una fotocopia della brutta." },
      ],
    },
    rubrica(["L'ordine della descrizione è rispettato fino alla fine.", "Almeno tre sensi e qualche indicatore spaziale.", "Titolo, lunghezza, grafia leggibile."]),
  ],
);

const scritturaRitratto = make(
  "ita-scrittura-ritratto",
  "Laboratorio di scrittura 2: fare un ritratto",
  "Il decalogo del ritratto, le due tracce, l'anatomia di un esempio e gli interventi per passare da «dire» a «mostrare».",
  [
    {
      title: "Il decalogo del ritratto",
      text: "Un buon ritratto fa riconoscere una persona anche senza dirne il nome.",
      blocks: [
        { t: "p", text: "Fare un ritratto non significa compilare una carta d'identità. Significa scegliere i tratti che rendono una persona unica e farla vedere al lettore mentre si muove, parla, agisce." },
        {
          t: "flip",
          title: "Dieci regole: tocca le carte",
          cards: [
            { front: "1 · Non è una carta d'identità", back: "Età, altezza e colore degli occhi messi in fila non fanno vedere nessuno. Un ritratto mostra una persona unica, non un modulo compilato." },
            { front: "2 · Trova il filo conduttore", back: "Decidi qual è la qualità principale della persona (la timidezza, l'allegria, la testardaggine) e fa' in modo che tutti i dettagli la confermino." },
            { front: "3 · Dal generale al particolare", back: "Prima l'impressione d'insieme, cioè la figura e il modo di muoversi; poi sempre più vicino: il volto, lo sguardo, le mani, un dettaglio." },
            { front: "4 · Fisico e carattere insieme", back: "L'aspetto esteriore e il modo di essere si completano, e spesso il corpo racconta il carattere: mani screpolate, unghie mangiucchiate, una postura rigida dicono già qualcosa." },
            { front: "5 · Mostra, non dire", back: "«È generosa» è un'etichetta; un gesto generoso è una prova. Lascia che il lettore capisca da solo, attraverso azioni, abitudini e parole." },
            { front: "6 · Cerca il dettaglio rivelatore", back: "Un oggetto sempre con sé, un tic, una frase ripetuta: un solo particolare ben scelto può riassumere una persona intera." },
            { front: "7 · Falla muovere e parlare", back: "Una persona ferma è una fotografia. Inserisci gesti, un breve episodio, una battuta di discorso diretto: anche la voce fa parte del ritratto." },
            { front: "8 · Evita gli stereotipi", back: "La nonna dolce, l'amico simpatico, il professore severo sono tipi, non persone. Cerca ciò che rende quella persona diversa da tutte le altre." },
            { front: "9 · Scegli chi guarda, con rispetto", back: "Il ritratto cambia se a guardare è un figlio, un amico o un estraneo: mantieni lo stesso punto di vista. Se descrivi una persona reale, puoi essere affettuoso o ironico, mai offensivo." },
            { front: "10 · Chiudi con un significato", back: "La conclusione dice che cosa rappresenta quella persona per chi scrive, oppure lascia un'ultima immagine che resta in mente." },
          ],
        },
        {
          t: "sort",
          title: "Etichetta o prova?",
          hint: "«Mostra, non dire»: separa le frasi che dichiarano da quelle che fanno vedere.",
          buckets: ["Etichetta (dice)", "Prova (mostra)"],
          items: [
            { text: "È generosa.", bucket: 0, why: "Dichiara una qualità senza provarla." },
            { text: "Divide sempre la merenda con chi non ne ha.", bucket: 1, why: "Un'abitudine che mostra la generosità." },
            { text: "Mia sorella è disordinata.", bucket: 0, why: "Etichetta." },
            { text: "Sulla scrivania il telefono fa da fermacarte ai quaderni e un calzino spunta dal libro di storia.", bucket: 1, why: "Fa vedere il disordine senza nominarlo." },
            { text: "Ha gli occhi grandi, azzurri, belli.", bucket: 0, why: "Lista di aggettivi." },
            { text: "Ha occhi grandi, di un azzurro chiaro che li fa sembrare sempre stupiti.", bucket: 1, why: "Un'immagine che si vede." },
          ],
        },
      ],
    },
    {
      title: "Le tracce e gli attrezzi",
      text: "Scegli una delle due tracce: 25-30 righe di foglio protocollo, con un titolo.",
      blocks: [
        {
          t: "flip",
          title: "Le due tracce",
          cards: [
            { front: "A · Una persona che conosco bene", back: "Descrivi una persona reale della tua vita: un familiare, un amico o un'amica, un allenatore, una vicina di casa. Fai emergere l'aspetto fisico e il carattere, e inserisci un breve episodio, anche di poche righe, in cui la persona fa o dice qualcosa che la rivela. Narratore interno, in prima persona." },
            { front: "B · Un personaggio da inventare", back: "Inventa un personaggio partendo da un solo dettaglio: un oggetto che porta sempre con sé, un modo di camminare, una frase che ripete. Costruisci il suo ritratto come se fosse l'inizio di un racconto e inserisci una scena breve in cui lo vediamo in azione. Narratore esterno, in terza persona." },
          ],
        },
        {
          t: "flip",
          title: "Gli attrezzi del mestiere",
          cards: [
            { front: "Dal generale al particolare", back: "Parti dall'impressione d'insieme (la corporatura, il modo di stare al mondo) e avvicinati a poco a poco: il volto, gli occhi, le mani, un dettaglio." },
            { front: "Fisico e carattere", back: "Un ritratto completo tiene insieme l'aspetto esteriore e il modo di essere: carattere, abitudini, modo di parlare, ciò che la persona pensa e desidera." },
            { front: "Mostrare, non dire", back: "Invece di scrivere «è generoso», fai vedere un gesto generoso. È la presentazione indiretta: il lettore capisce da solo, e ricorda di più." },
            { front: "Il dettaglio rivelatore", back: "Un oggetto, un tic, un'abitudine, una frase ricorrente: un solo particolare ben scelto può racchiudere un'intera persona." },
            { front: "Selezionare", back: "Non serve dire tutto: scegli le caratteristiche utili al ritratto. Se un dettaglio c'è, deve avere una funzione." },
            { front: "Una battuta basta", back: "Una frase di discorso diretto fa sentire la voce della persona. Attenzione alla punteggiatura: Disse: «…». oppure «…», disse." },
          ],
        },
      ],
    },
    {
      title: "Anatomia di un esempio",
      text: "«Il signor Ottavio»: i numeri indicano le tecniche usate.",
      blocks: [
        { t: "p", text: "Il signor Ottavio abita al piano di sotto da prima che io nascessi. È un uomo basso e asciutto, con le spalle un po' curve, come se passasse la vita a cercare qualcosa per terra. I capelli bianchi, sempre pettinati all'indietro con l'acqua, lasciano scoperta una fronte larga, attraversata da tre rughe parallele che si alzano tutte insieme quando qualcosa lo sorprende. D'estate e d'inverno porta lo stesso gilet marrone, con un taschino da cui spunta una matita senza gomma." },
        { t: "p", text: "Non parla molto, ma osserva tutto. Un pomeriggio di giugno la catena della mia bicicletta era saltata e io, seduto sul marciapiede, stavo per arrendermi. Lui uscì senza dire una parola, si inginocchiò sull'asfalto caldo e in due minuti rimise tutto a posto. Poi si pulì le mani, nere di grasso, nel fazzoletto e disse soltanto: «La prossima volta guarda come faccio». Da allora, ogni volta che qualcosa si rompe, so a quale porta bussare." },
        {
          t: "sort",
          title: "Che tecnica usa ogni frase?",
          buckets: ["Presentazione", "Impressione d'insieme", "Sguardo sul volto", "Dettaglio rivelatore", "Carattere", "Episodio", "Battuta", "Conclusione"],
          items: [
            { text: "Il signor Ottavio abita al piano di sotto da prima che io nascessi.", bucket: 0, why: "Chi è e che rapporto ha con chi scrive." },
            { text: "È un uomo basso e asciutto, con le spalle un po' curve, come se passasse la vita a cercare qualcosa per terra.", bucket: 1, why: "Figura d'insieme e similitudine." },
            { text: "I capelli bianchi lasciano scoperta una fronte larga, attraversata da tre rughe parallele", bucket: 2, why: "Lo sguardo si avvicina al volto." },
            { text: "D'estate e d'inverno porta lo stesso gilet marrone, con una matita senza gomma nel taschino.", bucket: 3, why: "Un oggetto sempre uguale." },
            { text: "Non parla molto, ma osserva tutto.", bucket: 4, why: "Il carattere in una frase breve." },
            { text: "Lui uscì senza dire una parola, si inginocchiò sull'asfalto caldo e in due minuti rimise tutto a posto.", bucket: 5, why: "La generosità si vede nei gesti, senza essere nominata." },
            { text: "«La prossima volta guarda come faccio».", bucket: 6, why: "Una sola battuta di discorso diretto." },
            { text: "Da allora, ogni volta che qualcosa si rompe, so a quale porta bussare.", bucket: 7, why: "Che cosa rappresenta la persona per chi scrive." },
          ],
        },
      ],
    },
    {
      title: "Prima ora: progettare e scrivere",
      text: "Dalla scelta della persona alla brutta copia.",
      blocks: [
        {
          t: "seq",
          title: "Ordina le fasi della prima ora",
          items: [
            "Scegli la persona e la qualità principale (un aggettivo che non scriverai mai)",
            "Raccogli i tratti: aspetto fisico, carattere e abitudini",
            "Trova il dettaglio rivelatore",
            "Immagina l'episodio che mostra la qualità senza nominarla",
            "Costruisci la scaletta e scrivi la brutta copia",
          ],
          why: "Prima si decide che cosa far capire, poi si cerca come mostrarlo.",
        },
        {
          t: "steps",
          title: "La scaletta del ritratto",
          items: [
            { title: "Presentazione", text: "Chi è, impressione d'insieme." },
            { title: "Ritratto fisico", text: "Dal generale al particolare." },
            { title: "Carattere ed episodio", text: "Abitudini, dettaglio rivelatore, scena." },
            { title: "Conclusione", text: "Che cosa rappresenta per te o per la storia." },
          ],
        },
      ],
    },
    {
      title: "Seconda ora: in officina",
      text: "Da «dire» a «mostrare».",
      blocks: [
        { t: "p", text: "Rileggi come un lettore: riconoscerebbe questa persona per strada? Ci sono sia l'aspetto fisico sia il carattere? L'episodio mostra la qualità principale senza nominarla? Ho evitato le liste di aggettivi? I tempi verbali sono coerenti: presente per il ritratto, passato per l'episodio (o tutto al passato)?" },
        {
          t: "fill",
          title: "a) Da «dire» a «mostrare»",
          items: [
            { before: "«Mia nonna è testarda» →", after: "", options: ["Mia nonna è molto testarda e non cambia idea.", "Mia nonna, quando decide di non cambiare strada, ripete la frase due volte, più piano.", "Mia nonna non è per niente flessibile."], answer: 1, why: "Un'abitudine e una scena: il lettore capisce la testardaggine senza la parola." },
            { before: "«Marco è timido» →", after: "", options: ["Marco è timido e riservato.", "Marco non ama molto parlare con gli altri.", "Marco saluta guardando le scarpe e risponde sempre sottovoce."], answer: 2, why: "Gesti concreti invece di un'etichetta." },
          ],
        },
        {
          t: "mark",
          title: "b) Dagli elenchi alle frasi",
          prompt: "Quali di queste frasi sono liste di aggettivi in fila, da trasformare?",
          words: [
            "È alta, magra, bionda, bella.",
            "Ha mani screpolate e unghie mangiucchiate, che sistema di continuo sotto il tavolo.",
            "Ha un carattere dolce, buono, simpatico.",
            "Si morde il labbro quando ascolta, come se ogni parola andasse pesata.",
          ],
          correct: [0, 2],
          why: "Le due liste di aggettivi non fanno vedere nessuno; le altre due mostrano con dettagli e gesti.",
        },
        {
          t: "fill",
          title: "c) La voce del personaggio",
          hint: "Controlla ogni battuta: virgolette aperte e chiuse, due punti prima della battuta oppure virgola dopo, maiuscola all'inizio.",
          items: [
            { before: "Quale è scritta bene?", after: "", options: ["Disse: «La prossima volta guarda come faccio».", "Disse «la prossima volta guarda come faccio»", "Disse: la prossima volta guarda come faccio."], answer: 0, why: "Due punti prima della battuta, virgolette aperte e chiuse, maiuscola iniziale." },
            { before: "E questa?", after: "", options: ["«Guarda bene» disse lui.", "«Guarda bene», disse lui.", "«Guarda bene.» Disse lui."], answer: 1, why: "Virgola dopo la battuta, fuori dalle virgolette; «disse» resta minuscolo." },
          ],
        },
      ],
    },
    rubrica(["Fisico e carattere sono entrambi presenti.", "La qualità principale si capisce senza essere dichiarata.", "Titolo, lunghezza, grafia leggibile."]),
  ],
);

const scritturaRacconto = make(
  "ita-scrittura-racconto",
  "Laboratorio di scrittura 3: raccontare una storia",
  "Il decalogo del testo narrativo, lo schema in cinque momenti, flashback e Spannung, e gli interventi di revisione su tempi, ritmo e dialoghi.",
  [
    {
      title: "Il decalogo del testo narrativo",
      text: "Un racconto funziona quando il lettore vuole sapere come va a finire.",
      blocks: [
        { t: "p", text: "Un racconto è una storia in cui qualcosa cambia. Per costruirlo servono un protagonista, un evento che rompe l'equilibrio e una voce che decide come e in quale ordine raccontare i fatti." },
        {
          t: "flip",
          title: "Dieci regole: tocca le carte",
          cards: [
            { front: "1 · Prima la storia, poi il testo", back: "Prima di scrivere sappi come comincia e, soprattutto, come finisce la tua storia. Chi scrive senza conoscere il finale di solito si perde a metà." },
            { front: "2 · Un protagonista che vuole qualcosa", back: "Ogni storia nasce da un desiderio o da un bisogno: ritrovare, scoprire, fuggire, ottenere, capire. Dai al protagonista un obiettivo e un tratto di carattere." },
            { front: "3 · Rompi l'equilibrio", back: "La situazione iniziale presenta chi, dove e quando; poi un fatto, l'esordio, cambia le cose. Senza un evento che rompe l'equilibrio non c'è storia." },
            { front: "4 · Metti ostacoli", back: "Le peripezie sono le difficoltà da superare, e devono crescere d'intensità. Se tutto va subito bene, il lettore si annoia." },
            { front: "5 · Costruisci la Spannung", back: "È il momento di massima tensione: rallenta il ritmo, usa frasi brevi e dettagli, tieni il lettore in sospeso." },
            { front: "6 · Un finale che nasce dai fatti", back: "Lo scioglimento è la conseguenza di ciò che è accaduto: niente «era tutto un sogno», niente colpi di fortuna piovuti dal cielo. Alla fine qualcosa è cambiato." },
            { front: "7 · Una voce sola", back: "Scegli il narratore, interno in prima persona o esterno in terza, e il punto di vista; poi mantienili dall'inizio alla fine." },
            { front: "8 · Tempi verbali con criterio", back: "Imperfetto per lo sfondo e le abitudini, passato remoto per le azioni, trapassato per i fatti anteriori; oppure il presente, ma per tutto il testo. Il flashback va segnalato con chiarezza." },
            { front: "9 · Dosa ritmo e dialoghi", back: "Scene ricche di dettagli per i momenti importanti, sommari per quelli di passaggio. Dialoghi pochi e utili, che facciano avanzare la storia o rivelino i personaggi, con la punteggiatura corretta." },
            { front: "10 · Il titolo alla fine", back: "Scegli il titolo dopo aver scritto: deve incuriosire senza svelare il finale. Poi rileggi tutto come se il racconto l'avesse scritto qualcun altro." },
          ],
        },
        {
          t: "sort",
          title: "Finale che funziona o finale da evitare?",
          buckets: ["Finale che nasce dai fatti", "Finale da evitare"],
          items: [
            { text: "Poi mi svegliai: era tutto un sogno.", bucket: 1, why: "Chiude la storia senza scioglierla." },
            { text: "E vissero felici e contenti.", bucket: 1, why: "Chiude senza scioglierla: nessuna conseguenza dei fatti." },
            { text: "Giulia salì sull'autobus successivo e per tutto il tragitto tenne il telefono in tasca, a guardare fuori dal finestrino.", bucket: 0, why: "Qualcosa è cambiato, e nasce da ciò che è accaduto." },
            { text: "All'improvviso arrivò uno sconosciuto con una valigia piena di soldi e risolse tutto.", bucket: 1, why: "Colpo di fortuna piovuto dal cielo." },
          ],
        },
      ],
    },
    {
      title: "Le tracce e gli attrezzi",
      text: "Scegli una delle due tracce: 30-40 righe di foglio protocollo, con un titolo.",
      blocks: [
        {
          t: "flip",
          title: "Le due tracce",
          cards: [
            { front: "A · L'oggetto dimenticato", back: "Cercando tutt'altro, trovi in un cassetto, in soffitta o in cantina un oggetto che avevi dimenticato. Descrivilo e racconta la storia che ti riporta alla mente: un ricordo vero oppure inventato. Narratore interno, in prima persona. Il racconto deve contenere un flashback." },
            { front: "B · Un oggetto qualunque", back: "Un oggetto comunissimo (un ombrello, una chiave, uno zaino scambiato, un biglietto dell'autobus) cambia per un giorno la vita del protagonista. Racconta che cosa succede. Narratore esterno, in terza persona. Il racconto deve avere una Spannung riconoscibile." },
          ],
        },
        {
          t: "flip",
          title: "Gli attrezzi del mestiere",
          cards: [
            { front: "Lo schema narrativo", back: "Situazione iniziale → esordio → peripezie → Spannung → scioglimento. Alla fine qualcosa deve essere cambiato rispetto all'inizio." },
            { front: "Una voce sola", back: "Scegli il narratore, interno in prima persona o esterno in terza, e mantienilo dalla prima all'ultima riga." },
            { front: "I tempi del racconto", back: "Imperfetto per lo sfondo, le descrizioni e le abitudini; passato remoto per le azioni che fanno avanzare la storia; trapassato per ciò che era accaduto prima. Oppure il presente, ma per tutto il testo." },
            { front: "Il flashback", back: "Segnala il salto nel passato con un'espressione (mi tornò in mente quando…, anni prima…) e con il trapassato; poi riporta chiaramente il lettore al presente della storia." },
            { front: "Il ritmo", back: "Accelera con il sommario dove non succede nulla d'importante; rallenta nella Spannung con frasi brevi e dettagli. La descrizione dell'oggetto è una pausa: tienila breve e utile." },
            { front: "Finali da evitare", back: "«Poi mi svegliai: era tutto un sogno» e «vissero felici e contenti» chiudono la storia senza scioglierla. Il finale deve nascere da ciò che è accaduto." },
          ],
        },
      ],
    },
    {
      title: "Anatomia di un esempio",
      text: "«Il biglietto del 12»: i numeri indicano le tecniche usate.",
      blocks: [
        { t: "p", text: "Ogni mattina Giulia prendeva l'autobus delle 7.32, sempre lo stesso, sempre seduta in terza fila, con le cuffie nelle orecchie e lo sguardo sul telefono. Quel martedì, però, mentre timbrava il biglietto, si accorse che sul retro qualcuno aveva scritto a matita: «Se lo trovi, scendi a Porta Nuova e guarda in alto»." },
        { t: "p", text: "Per due fermate finse di non pensarci. Poi si guardò intorno: nessuno sembrava fare caso a lei. Le tornò in mente la nonna: quando Giulia era piccola, le aveva nascosto in casa decine di bigliettini con indovinelli, e le ripeteva sempre: «Chi non cerca, non trova». Quando l'autobus frenò a Porta Nuova, Giulia si alzò di scatto, prima di poter cambiare idea." },
        { t: "p", text: "Sul marciapiede faceva freddo. La gente le passava accanto di fretta. Alzò gli occhi. Niente: grondaie, finestre chiuse, un piccione. Stava per tornare indietro. Poi lo vide." },
        { t: "p", text: "Sul muro scrostato del palazzo d'angolo, all'altezza del secondo piano, qualcuno aveva dipinto un enorme sole giallo e, sotto, una scritta: «Oggi alza lo sguardo». Giulia rimase lì, con il naso all'insù. Poi salì sull'autobus successivo e per tutto il tragitto tenne il telefono in tasca, a guardare fuori dal finestrino." },
        {
          t: "sort",
          title: "Che momento dello schema è?",
          buckets: ["Situazione iniziale", "Esordio", "Peripezie", "Flashback", "Spannung", "Scioglimento"],
          items: [
            { text: "Ogni mattina Giulia prendeva l'autobus delle 7.32, sempre lo stesso…", bucket: 0, why: "Un'abitudine, all'imperfetto." },
            { text: "Quel martedì, però, … si accorse che sul retro qualcuno aveva scritto a matita…", bucket: 1, why: "Un fatto rompe l'equilibrio (passato remoto)." },
            { text: "Per due fermate finse di non pensarci. Poi si guardò intorno.", bucket: 2, why: "Esitazione e decisione." },
            { text: "Le tornò in mente la nonna: quando Giulia era piccola, le aveva nascosto in casa decine di bigliettini…", bucket: 3, why: "Segnalato da «le tornò in mente» e dal trapassato." },
            { text: "Sul marciapiede faceva freddo. … Alzò gli occhi. Niente. … Poi lo vide.", bucket: 4, why: "Frasi brevi: il ritmo rallenta." },
            { text: "Poi salì sull'autobus successivo e per tutto il tragitto tenne il telefono in tasca…", bucket: 5, why: "Un nuovo equilibrio: la protagonista è cambiata." },
          ],
        },
      ],
    },
    {
      title: "Prima ora: progettare e scrivere",
      text: "Ordina le idee prima di scrivere.",
      blocks: [
        {
          t: "seq",
          title: "Costruisci lo schema narrativo",
          items: [
            "Situazione iniziale: chi, dove, quando",
            "Esordio: un fatto rompe l'equilibrio",
            "Peripezie: ostacoli che crescono",
            "Spannung: il momento di massima tensione",
            "Scioglimento: qualcosa è cambiato",
          ],
          why: "Nella traccia A indica anche dove inserirai il flashback e che cosa racconterà.",
        },
        {
          t: "steps",
          title: "Le scelte di partenza",
          items: [
            { title: "Traccia e voce", text: "Traccia A (narratore interno, flashback) o traccia B (narratore esterno, Spannung). Tempi: passato oppure presente per tutto il testo." },
            { title: "L'oggetto al centro", text: "Com'è (forma, materiale, colore, segni del tempo), dove si trova o viene trovato, che cosa provoca (un ricordo, un problema, un incontro): pochi dettagli, precisi." },
            { title: "Personaggi, luogo, tempo", text: "Protagonista (nome, età, un tratto di carattere, che cosa vuole), altri personaggi (chi aiuta, chi ostacola), dove e quando." },
            { title: "Brutta copia", text: "Una riga sì e una no, seguendo la scaletta, senza fermarti su ogni parola. Se un'idea nuova ti sembra migliore, usala." },
          ],
        },
      ],
    },
    {
      title: "Seconda ora: in officina",
      text: "Tempi verbali, Spannung, connettivi e verbi del dire.",
      blocks: [
        { t: "p", text: "Rileggi la brutta copia come un lettore: nelle prime righe si capisce chi, dove e quando? L'esordio rompe davvero l'equilibrio? La Spannung tiene in sospeso? Lo scioglimento nasce dai fatti? Il narratore è sempre lo stesso? Il flashback (traccia A) comincia e finisce in modo chiaro?" },
        {
          t: "fill",
          title: "a) Caccia ai tempi verbali",
          items: [
            { before: "«Marco entrò in cucina e vede che la finestra era aperta» →", after: "", options: ["Marco entrò in cucina e vide che la finestra era aperta.", "Marco entra in cucina e vide che la finestra è aperta.", "Marco entrava in cucina e vide che la finestra aprì."], answer: 0, why: "Passato remoto per le azioni, imperfetto per la situazione." },
            { before: "«Quando arrivai alla stazione, il treno partiva già da dieci minuti» →", after: "", options: ["Quando arrivai alla stazione, il treno partì già da dieci minuti.", "Quando arrivai alla stazione, il treno era già partito da dieci minuti.", "Quando arrivai alla stazione, il treno parte già da dieci minuti."], answer: 1, why: "Un fatto anteriore all'arrivo vuole il trapassato prossimo: era già partito." },
          ],
        },
        {
          t: "fill",
          title: "b) Rallenta la Spannung",
          hint: "Nel momento di massima tensione: frasi brevi e un dettaglio dei sensi.",
          items: [
            { before: "«Aprì la porta e vide che non c'era nessuno» →", after: "", options: ["Aprì la porta e vide con grande sorpresa che non c'era assolutamente nessuno.", "Spinse la porta. Cigolò. Dentro, buio e odore di polvere. Nessuno.", "Aprì la porta e, guardandosi intorno con calma, non vide nessuno."], answer: 1, why: "Frasi brevi, un suono e un odore: il ritmo rallenta." },
          ],
        },
        {
          t: "mark",
          title: "c) Connettivi e verbi del dire",
          prompt: "Tocca le parole ripetitive da sostituire: «Poi Marco disse che veniva. Poi Anna disse che non poteva. Poi lui disse di no.»",
          words: ["Poi", "disse", "veniva", "Anna", "non poteva", "Poi", "disse", "di no"],
          correct: [0, 1, 5, 6],
          why: "Sostituisci i «poi» (in quel momento, subito dopo, intanto…) e i «disse» (sussurrò, ribatté, ammise, borbottò, chiese…).",
        },
        {
          t: "fill",
          title: "d) Dialogo con la punteggiatura giusta",
          items: [
            { before: "Quale è scritta bene?", after: "", options: ["Giulia sussurrò: «Posso provare ancora?»", "Giulia sussurrò «posso provare ancora»?", "Giulia sussurrò, posso provare ancora."], answer: 0, why: "Due punti, virgolette, punto interrogativo dentro la battuta, maiuscola iniziale." },
          ],
        },
      ],
    },
    rubrica(["Tutti e cinque i momenti dello schema narrativo.", "Narratore e tempi verbali mantenuti per tutto il testo.", "Titolo, lunghezza, grafia leggibile."]),
  ],
);

export const ITALIAN_LESSONS: Lesson[] = [fonologia, ortografia, punteggiatura, parti, mito, narratologia, scritturaLuogo, scritturaRitratto, scritturaRacconto, riassunto];

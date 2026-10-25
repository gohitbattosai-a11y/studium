export const PET_LINES: Record<string, string[]> = {
  coniglio: [
    "Hop hop! Ho trovato una carota... virtuale.",
    "Le mie orecchie sentono i compiti in arrivo.",
    "Un coniglio salta altissimo: tu puoi finire quel compito!",
    "Sto saltellando per fare il tifo per te.",
  ],
  gatto: [
    "Miao. Non mi serve un motivo per fissarti.",
    "Se ti siedi sulla tastiera è colpa mia, scusa.",
    "Sai che i gatti dormono 16 ore al giorno? Io sono in pausa.",
    "Ho fatto cadere un bicchiere. Per scienza.",
  ],
  cane: [
    "Bau! Hai fatto una pausa? Io aspetto una carezza!",
    "Sei un bravissimo studente, bravo!",
    "Pronto a riportarti la pallina... o i compiti!",
    "Ho sentito la parola 'passeggiata'? No? Peccato.",
  ],
  tartaruga: [
    "Piano piano si arriva lontano.",
    "Le tartarughe vivono anche più di 100 anni. Ho tutto il tempo.",
    "Sto camminando da stamattina per arrivare qui.",
    "Respira con calma: i compiti non scappano... io nemmeno.",
  ],
  lupo: [
    "Auuu! Il branco studia insieme.",
    "Un lupo solitario non prende bei voti. Fate gruppo!",
    "Di notte vedo meglio, ma i compiti falli di giorno.",
    "Fiuto una bella interrogazione in arrivo.",
  ],
  drago: [
    "Ho sputato fuoco sui compiti difficili: ora sono cenere.",
    "Custodisco un tesoro: i vostri punti.",
    "Vola alto, studia meglio.",
    "Un drago non ha paura delle verifiche. Quasi.",
  ],
};

export const GENERIC_LINES = [
  "Ricordati di bere un po' d'acqua!",
  "Stirati un attimo: la schiena ringrazia.",
  "Una pausa ogni tanto fa bene al cervello.",
  "Hai già controllato la bacheca?",
  "Nello Shop ci sono icone animate bellissime.",
  "Sai che puoi creare giochi nel Game hub?",
  "Ogni giorno un pochino: così si impara davvero.",
  "Fai un respiro profondo. Ce la fai!",
  "Sapevi che il miele non scade mai?",
  "I polpi hanno tre cuori. Io ne ho uno solo, ma enorme.",
];

export const greeting = (hour: number, nick: string) => {
  if (hour < 6) return `${nick}, è tardi! Un po' di riposo?`;
  if (hour < 12) return `Buongiorno ${nick}!`;
  if (hour < 18) return `Buon pomeriggio ${nick}!`;
  return `Buonasera ${nick}!`;
};

export const ADVICE = [
  "Consiglio: studia 25 minuti e riposa 5. Funziona!",
  "Consiglio: ripeti ad alta voce, così ricordi meglio.",
  "Consiglio: inizia dalla materia che ti piace meno, poi sarà tutto in discesa.",
  "Consiglio: spegni le notifiche mentre studi, ti faccio io la guardia.",
  "Consiglio: dormi bene prima di una verifica, vale più di un'ora di ripasso.",
  "Consiglio: dividi un compito grande in tre piccoli passi.",
  "Consiglio: spiega l'argomento a qualcuno, anche a me. Io ascolto!",
  "Consiglio: fai gli esercizi difficili quando sei riposato.",
  "Consiglio: scrivi a mano i concetti chiave, restano più impressi.",
  "Consiglio: premiati dopo aver finito: te lo sei meritato!",
];

export const LOOK_LINES = [
  "Ehi, ti vedo! Cosa stai facendo col mouse?",
  "Ti seguo con lo sguardo... non scappare!",
  "Eccomi! Sono venuto a vedere cosa fai.",
  "Cosa clicchi di bello?",
  "Che c'è là? Ho visto qualcosa muoversi.",
];

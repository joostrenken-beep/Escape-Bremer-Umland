# Rätseltypen – Beispiele zum Kopieren

Jede Station hat eine Liste `steps`. Jeder Schritt hat einen `type`. Alle Beispiele stammen aus der Worpswede-Tour.
Gemeinsam für alle Typen: `id`, `prompt` (Text je Stufe), genau 3 `hints`, `verified` (false = vor Ort prüfen).
Typen mit `codeId` brauchen einen Eintrag in den Codes (`codes.example.json` bzw. Secret).

## `code`

Code vor Ort finden (Jahreszahl, Inschrift, Anzahl …). Optional `"image": "media/detail.jpg"` für ein Bildausschnitt-Rätsel („Findet dieses Detail“). `fallback` = Ersatzfrage für „Hier stimmt etwas nicht“.

Aus `content/worpswede/stations/01-kaffee-worpswede.json`:

```json
{
  "type": "code",
  "id": "unlock",
  "prompt": {
    "all": {
      "de": "[PLATZHALTER] Zählt die runden Fenster an der Vorderseite des Hauses. Wie viele sind es?"
    }
  },
  "codeId": "s01-unlock",
  "input": "number",
  "hints": [
    {
      "all": {
        "de": "Stellt euch etwas entfernt auf, dann seht ihr die ganze Vorderseite."
      }
    },
    {
      "all": {
        "de": "Zählt nur Fenster, die wirklich rund sind."
      }
    },
    {
      "all": {
        "de": "Zeigt beim Zählen mit dem Finger auf jedes Fenster – von links nach rechts."
      }
    }
  ],
  "fallback": {
    "prompt": {
      "all": {
        "de": "[PLATZHALTER] Welche Farbe hat die Eingangstür?"
      }
    },
    "codeId": "s01-fallback",
    "input": "text"
  },
  "verified": false,
  "verifyNote": "Gibt es eine gut sichtbare, zählbare Eigenschaft an der Fassade (z. B. runde Fenster)? Zahl notieren. Ersatzfrage ebenfalls prüfen."
}
```

## `audio`

Zeugenaussage zum Anhören (Sprachausgabe oder eigene Datei über `"audio": "media/aussage.mp3"`), danach Frage. Die Aussage ist immer auch als Text lesbar.

Aus `content/worpswede/stations/05-zionskirche.json`:

```json
{
  "type": "audio",
  "id": "witness",
  "speaker": {
    "de": "Frau Gerdes, Nachbarin"
  },
  "speech": {
    "all": {
      "de": "Also, ich war mit meinem Dackel Bruno unterwegs, so gegen zwanzig vor eins. Da kam jemand den Weg hoch, mit einem großen, flachen Paket in braunem Packpapier. Die Person trug einen langen grünen Schal und hatte einen Schlüsselbund in der Hand. Sie ging eilig Richtung Gipfel. Erkannt habe ich sie nicht, es war ja dunkel."
    },
    "easy": {
      "de": "Ich war mit meinem Dackel Bruno spazieren. Da kam eine junge Frau mit einem großen, flachen Paket. Sie hat fröhlich ein Geburtstagslied gesummt und ist Richtung Berg gelaufen."
    }
  },
  "prompt": {
    "all": {
      "de": "Welche Farbe hatte der Schal der Person?"
    },
    "easy": {
      "de": "Wie heißt der Hund von Frau Gerdes?"
    }
  },
  "codeId": "s05-witness",
  "input": "text",
  "hints": [
    {
      "all": {
        "de": "Hört euch die Aussage noch einmal an – oder lest sie als Text."
      }
    },
    {
      "all": {
        "de": "Es geht um ein Kleidungsstück am Hals."
      },
      "easy": {
        "de": "Der Hund ist ein Dackel."
      }
    },
    {
      "all": {
        "de": "Die Farbe passt zu Birkenblättern im Sommer."
      },
      "easy": {
        "de": "Der Name beginnt mit B."
      }
    }
  ],
  "verified": true,
  "verifyNote": "Audio-Rätsel ohne Ortsbezug (Sprachausgabe; eigene Aufnahme später möglich)."
}
```

## `morse`

Morse-Töne + Blinklicht. `message` nur Großbuchstaben/Ziffern. `showTable`: Morse-Tabelle direkt zeigen (sonst erst nach Hinweis 1).

Aus `content/worpswede/stations/08-alter-bahnhof.json`:

```json
{
  "type": "morse",
  "id": "signal",
  "message": {
    "all": "NULL"
  },
  "showTable": {
    "easy": true,
    "medium": true,
    "hard": false
  },
  "prompt": {
    "all": {
      "de": "Was wird gemorst? Schreibt das Wort auf."
    },
    "easy": {
      "de": "Welches Wort piept der Kasten?"
    }
  },
  "codeId": "s08-morse",
  "input": "text",
  "hints": [
    {
      "all": {
        "de": "Die Morse-Tabelle ist jetzt freigeschaltet. Kurz = •, lang = –."
      },
      "easy": {
        "de": "Schaut in die Tabelle: Kurz = •, lang = –."
      }
    },
    {
      "all": {
        "de": "Der erste Buchstabe ist lang–kurz: N."
      }
    },
    {
      "all": {
        "de": "Das Wort ist eine Zahl mit vier Buchstaben."
      }
    }
  ],
  "verified": true,
  "verifyNote": "Morse-Rätsel ohne Ortsbezug."
}
```

## `colorfilter`

Versteckte Nachricht unter rotem Gekritzel, lesbar mit dem Rotfilter. `message` max. 14 Zeichen.

Aus `content/worpswede/stations/02-grosse-kunstschau.json`:

```json
{
  "type": "colorfilter",
  "id": "filter",
  "prompt": {
    "all": {
      "de": "Albers hat hier einen Zettel liegen lassen – über und über mit rotem Gekritzel. Legt den Rotfilter auf! Welches Wort steht darunter?"
    },
    "easy": {
      "de": "Hier liegt ein Zettel voller rotem Gekritzel. Legt den Rotfilter auf! Welches Wort ist versteckt?"
    }
  },
  "message": {
    "medium": "KOPIE",
    "hard": "KOPIE",
    "easy": "TORTE"
  },
  "codeId": "s02-filter",
  "input": "text",
  "hints": [
    {
      "all": {
        "de": "Tippt auf „Rotfilter auflegen“."
      }
    },
    {
      "all": {
        "de": "Mit Filter verschwindet das Rote – das dunkle Wort bleibt stehen."
      }
    },
    {
      "all": {
        "de": "Das Wort hat fünf Buchstaben."
      },
      "medium": {
        "de": "Das Wort hat fünf Buchstaben und beginnt mit K."
      },
      "hard": {
        "de": "Das Wort hat fünf Buchstaben und beginnt mit K."
      }
    }
  ],
  "verified": true,
  "verifyNote": "Digitales Rätsel ohne Ortsbezug."
}
```

## `overlay`

Historisches Foto halbtransparent über dem Kamerabild (Schieberegler). Braucht ein Foto in `media/` mit Quelle/Lizenz in `credit`. (Aus Worpswede Station 9 vorerst entfernt, bis ein gemeinfreies Foto da ist.)

Aus `content/worpswede/stations/09-barkenhoff.json`:

```json
{
  "type": "overlay",
  "id": "compare",
  "image": "media/barkenhoff-historisch.svg",
  "credit": {
    "de": "[PLATZHALTER] Historisches Foto folgt – gemeinfreies Bild mit Quelle und Lizenz einfügen."
  },
  "prompt": {
    "all": {
      "de": "[PLATZHALTER] Vergleicht das alte Foto mit dem Barkenhoff heute. Was ist auf dem alten Foto zu sehen, das es heute nicht mehr gibt?"
    }
  },
  "codeId": "s09-compare",
  "input": "text",
  "hints": [
    {
      "all": {
        "de": "[PLATZHALTER] Hinweis 1"
      }
    },
    {
      "all": {
        "de": "[PLATZHALTER] Hinweis 2"
      }
    },
    {
      "all": {
        "de": "[PLATZHALTER] Hinweis 3"
      }
    }
  ],
  "verified": false,
  "verifyNote": "Gemeinfreies historisches Foto des Barkenhoffs besorgen (z. B. Wikimedia Commons), Standort für den Vergleich wählen, Frage + Antwort + Hinweise festlegen."
}
```

## `lock`

Zahlenschloss mit Drehrädern. `digits` = Anzahl Ziffern.

Aus `content/worpswede/stations/10-finale.json`:

```json
{
  "type": "lock",
  "id": "lock",
  "codeId": "s10-lock",
  "digits": 4,
  "prompt": {
    "easy": {
      "de": "Öffnet das Zahlenschloss! Schaut im Notizbuch nach den Fragmenten A, B, C und D und setzt ihre Zahlen der Reihe nach zusammen."
    },
    "medium": {
      "de": "Öffnet das Zahlenschloss! Setzt die Ziffern der Skizzenbuch-Fragmente A, B, C und D in dieser Reihenfolge zusammen."
    },
    "hard": {
      "de": "Ihr habt vier Ziffern gefunden. In der richtigen Reihenfolge ergeben sie das Jahr, in dem die Mondnacht gemalt wurde. Wie lautet die Kombination?"
    }
  },
  "hints": [
    {
      "all": {
        "de": "Öffnet das Notizbuch – oben rechts – und sucht die Fragmente."
      },
      "hard": {
        "de": "Die Ziffern sind 1, 9, 0 und 2. Lest noch einmal die Fallakte vom Anfang."
      }
    },
    {
      "all": {
        "de": "A = 1 und B = 9."
      },
      "hard": {
        "de": "Die Mondnacht wurde „um 1902“ gemalt."
      }
    },
    {
      "all": {
        "de": "Die Kombination beginnt mit 19…"
      },
      "hard": {
        "de": "Die Kombination beginnt mit 19…"
      }
    }
  ],
  "verified": true,
  "verifyNote": "Kombinationsrätsel aus den Notizbuch-Fragmenten (A=1, B=9, C=0, D=2), kein Ortsbezug."
}
```

## `slider`

Schiebepuzzle eines Bildes. `size` = Raster je Stufe (3 = 3×3). Kein Code – `solutionText` ist die Auflösung.

Aus `content/worpswede/stations/07-haus-im-schluh.json`:

```json
{
  "type": "slider",
  "id": "puzzle",
  "image": "media/mondnacht.svg",
  "size": {
    "easy": 3,
    "medium": 3,
    "hard": 4
  },
  "prompt": {
    "all": {
      "de": "Neben dem Protokoll liegt ein zerschnittenes Foto der Mondnacht. Setzt es wieder zusammen – vielleicht verrät es mehr über das Original!"
    },
    "easy": {
      "de": "Lotte hat ein Foto der Mondnacht als Vorlage zerschnitten. Setzt es wieder zusammen!"
    }
  },
  "solutionText": {
    "all": {
      "de": "Das Foto zeigt die Mondnacht: Weyerberg mit Kirchturm, Birken, eine Kate mit Licht und ein großer Mond über dem Moor – signiert „J. Behrens 1902“."
    }
  },
  "hints": [
    {
      "all": {
        "de": "Beginnt mit der obersten Reihe: Mond und Himmel."
      }
    },
    {
      "all": {
        "de": "Löst erst die oberen Reihen, dann die unteren – die letzten Teile schiebt ihr im Kreis."
      }
    },
    {
      "all": {
        "de": "Unten rechts steht die Signatur – dieses Teil gehört ganz nach unten rechts."
      }
    }
  ],
  "verified": true,
  "verifyNote": "Digitales Rätsel ohne Ortsbezug (Bild: eigene Illustration)."
}
```

## `compass`

Handy in eine Himmelsrichtung halten (`bearing` in Grad, 0 = Nord). `ar: true` bietet Kamera-Einblendung an. Ohne Kompass wählt man die Richtung per Knopf.

Aus `content/worpswede/stations/06-niedersachsenstein.json`:

```json
{
  "type": "compass",
  "id": "lookout",
  "prompt": {
    "medium": {
      "de": "Das Atelier am Moorgraben liegt im Südwesten. Richtet das Handy in diese Richtung und haltet es still."
    },
    "hard": {
      "de": "Das Atelier liegt in Richtung 225°. Richtet das Handy genau dorthin."
    },
    "easy": {
      "de": "Lottes Atelier liegt im Südwesten. Dreht euch langsam, bis der Kreis grün leuchtet!"
    }
  },
  "bearing": 225,
  "tolerance": {
    "easy": 30,
    "medium": 20,
    "hard": 12
  },
  "ar": true,
  "revealText": {
    "all": {
      "de": "Dort unten am Moorgraben: ein Dach mit Oberlicht – das Restaurierungsatelier G. Vogt. In einem Fenster brennt noch Licht."
    },
    "easy": {
      "de": "Da unten! Ein kleines Haus mit bunten Luftballons am Fenster – das ist Lottes Atelier!"
    }
  },
  "solutionText": {
    "all": {
      "de": "Die gesuchte Richtung ist Südwesten (225°). Dort liegt das Atelier am Moorgraben."
    }
  },
  "hints": [
    {
      "all": {
        "de": "Die Sonne steht mittags im Süden – Südwesten liegt etwas rechts davon."
      }
    },
    {
      "all": {
        "de": "Haltet das Handy flach vor euch und dreht euch langsam im Kreis."
      }
    },
    {
      "all": {
        "de": "Kein Kompass? Tippt auf „Ohne Kompass lösen“ und wählt Südwesten."
      }
    }
  ],
  "verified": false,
  "verifyNote": "Ist vom Niedersachsenstein aus Richtung Südwesten freie Sicht über das Moor (Bäume)? Sonst Richtung (bearing) anpassen."
}
```

## `accuse`

Abschlussbericht mit Auswahlfragen. Jede Frage hat eine eigene `codeId`; die Antwort in den Codes ist die `id` der richtigen Option. Bringt den Finale-Bonus.

Aus `content/worpswede/stations/10-finale.json`:

```json
{
  "type": "accuse",
  "id": "report",
  "prompt": {
    "all": {
      "de": "Die Mondnacht ist gefunden! Jetzt fehlt nur noch euer Ermittlungsbericht. Beantwortet alle drei Fragen – beim ersten Versuch ohne Hinweis gibt es 100 Bonuspunkte."
    },
    "easy": {
      "de": "Ihr habt die Mondnacht gefunden! Jetzt noch drei Detektiv-Fragen – wenn ihr alles beim ersten Mal richtig habt, gibt es 100 Bonuspunkte!"
    }
  },
  "questions": [
    {
      "id": "who",
      "codeId": "s10-who",
      "prompt": {
        "all": {
          "de": "Wer hat die Mondnacht aus dem Haus Lindenhof geholt?"
        },
        "easy": {
          "de": "Wer hat das Bild mitgenommen?"
        }
      },
      "options": [
        {
          "id": "greta",
          "label": {
            "all": {
              "de": "Greta Vogt, Restauratorin"
            }
          }
        },
        {
          "id": "albers",
          "label": {
            "all": {
              "de": "Konrad Albers, Kunsthändler"
            }
          }
        },
        {
          "id": "ben",
          "label": {
            "all": {
              "de": "Ben Harms, Enkel"
            }
          }
        },
        {
          "id": "lotte",
          "label": {
            "all": {
              "de": "Lotte Mewes, Doktorandin"
            }
          }
        }
      ]
    },
    {
      "id": "why",
      "codeId": "s10-why",
      "prompt": {
        "all": {
          "de": "Warum?"
        }
      },
      "options": [
        {
          "id": "geld",
          "label": {
            "all": {
              "de": "Um sie heimlich zu verkaufen"
            }
          }
        },
        {
          "id": "schutz",
          "label": {
            "all": {
              "de": "Um sie vor dem Austausch gegen eine Fälschung zu schützen"
            }
          }
        },
        {
          "id": "geschenk",
          "label": {
            "all": {
              "de": "Um sie als Geburtstagsgeschenk abzumalen"
            }
          }
        },
        {
          "id": "erbe",
          "label": {
            "all": {
              "de": "Um sich das Erbe zu sichern"
            }
          }
        }
      ]
    },
    {
      "id": "who2",
      "codeId": "s10-who2",
      "prompt": {
        "all": {
          "de": "Wer wollte das Original heimlich gegen eine Kopie tauschen?"
        },
        "easy": {
          "de": "Wer hat die blauen Farbkleckse gefunden und euch auf die Spur gebracht?"
        }
      },
      "options": [
        {
          "id": "greta",
          "label": {
            "all": {
              "de": "Greta Vogt"
            }
          }
        },
        {
          "id": "albers",
          "label": {
            "all": {
              "de": "Konrad Albers"
            }
          }
        },
        {
          "id": "ben",
          "label": {
            "all": {
              "de": "Ben Harms"
            }
          }
        },
        {
          "id": "lotte",
          "label": {
            "all": {
              "de": "Lotte Mewes"
            }
          }
        }
      ]
    }
  ],
  "solutionText": {
    "all": {
      "de": "Greta Vogt hat die Mondnacht versteckt – um sie zu schützen. Konrad Albers wollte das Original gegen seine Fälschung tauschen und nach Hamburg schaffen."
    },
    "easy": {
      "de": "Lotte hat das Bild mitgenommen, um es als Geburtstagsgeschenk für Oma Lindenhof abzumalen. Ben hat die blauen Farbkleckse gefunden."
    }
  },
  "hints": [
    {
      "all": {
        "de": "Lest im Notizbuch das Restaurierungsprotokoll und den Frachtzettel."
      },
      "easy": {
        "de": "Wer hatte blaue Farbe an den Händen?"
      }
    },
    {
      "all": {
        "de": "Wer trägt einen grünen Schal – wie die Person mit dem Paket?"
      },
      "easy": {
        "de": "Lest die Einladung im Notizbuch: Wer hat bald Geburtstag?"
      }
    },
    {
      "all": {
        "de": "Greta hat das Bild genommen, Albers wollte tauschen. Und warum Greta?"
      },
      "easy": {
        "de": "Es war Lotte – und sie wollte jemandem eine Freude machen."
      }
    }
  ],
  "verified": true,
  "verifyNote": "Abschlussfragen ohne Ortsbezug."
}
```

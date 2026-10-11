function initArtistas(options = {}) {
    const root = document.querySelector(".artists-page");

    if (!root || root.dataset.initialized === "true") return;

    root.dataset.initialized = "true";
    window.sonoraArtistsCleanup?.();

    const controller = new AbortController();

    const on = (target, type, handler, extra = {}) => {
        target?.addEventListener(type, handler, {
            ...extra,
            signal: controller.signal
        });
    };

    /* ========================================
       PERFILES DE ARTISTAS
    ======================================== */

    const artistProfiles = {
    "the-police": {
        "name": "The Police",
        "genre": "Rock · New Wave",
        "image": "assets/andromeda/artists/the-police.svg?v=2",
        "bio": "El trío británico unió rock, reggae y new wave con una identidad propia. Sus melodías tensas, ritmos precisos y la voz de Sting marcaron el sonido de finales de los setenta y los ochenta.",
        "tags": [
            "Reino Unido",
            "Desde 1977",
            "6 Grammy"
        ],
        "tracks": [
            {
                "title": "Every Breath You Take",
                "artist": "The police",
                "audio": "Canciones/The police.mpeg",
                "image": "assets/andromeda/songs/the-police-every-breath-you-take.svg?v=2"
            }
        ]
    },
    "scorpions": {
        "name": "Scorpions",
        "genre": "Rock · Hard Rock",
        "image": "assets/andromeda/artists/scorpions.svg?v=2",
        "bio": "Una de las bandas de rock más influyentes de Alemania. Sus guitarras poderosas y grandes baladas convirtieron su música en un puente entre generaciones.",
        "tags": [
            "Alemania",
            "Desde 1965",
            "Hard Rock"
        ],
        "tracks": [
            {
                "title": "Wind of Change",
                "artist": "Scorpions",
                "audio": "Canciones/Scorpions.mpeg",
                "image": "assets/andromeda/songs/scorpions-wind-of-change.svg?v=2"
            },
            {
                "title": "Still Loving You",
                "artist": "Scorpions",
                "audio": "Canciones/scorpions-still-loving-you.mp3",
                "image": "assets/andromeda/songs/scorpions-still-loving-you.svg?v=2"
            },
            {
                "title": "Rock You Like a Hurricane",
                "artist": "Scorpions",
                "audio": "Canciones/scorpions-rock-you-like-a-hurricane.mp3",
                "image": "assets/andromeda/songs/scorpions-rock-you-like-a-hurricane.svg?v=2"
            },
            {"title": "Always Somewhere", "artist": "Scorpions", "audio": "Canciones/scorpions-always-somewhere.mp3", "image": "assets/andromeda/songs/scorpions-always-somewhere.svg?v=2"}
        ]
    },
    "eiffel-65": {
        "name": "Eiffel 65",
        "genre": "Electrónica",
        "image": "assets/andromeda/artists/eiffel-65.svg?v=2",
        "bio": "Explora la selección de Eiffel 65 en ANDROMEDA. Sus canciones disponibles se reúnen aquí para escucharlas, guardarlas y volver a ellas.",
        "tags": [
            "Electrónica",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Blue (Da Ba Dee)",
                "artist": "Eiffel 65",
                "audio": "Canciones/65.mpeg",
                "image": "assets/andromeda/songs/eiffel-65-blue-da-ba-dee.svg?v=2"
            }
        ]
    },
    "the-outfield": {
        "name": "The Outfield",
        "genre": "Rock",
        "image": "assets/andromeda/artists/the-outfield.svg?v=2",
        "bio": "Explora la selección de The Outfield en ANDROMEDA. Sus canciones disponibles se reúnen aquí para escucharlas, guardarlas y volver a ellas.",
        "tags": [
            "Rock",
            "3 canciones"
        ],
        "tracks": [
            {
                "title": "Your Love",
                "artist": "The Outfield",
                "audio": "Canciones/The Outfield - Your Love.mp3.mpeg",
                "image": "assets/andromeda/songs/the-outfield-your-love.svg?v=2"
            },
            {
                "title": "Say It Isn't So",
                "artist": "The Outfield",
                "audio": "Canciones/The Outfield - Say It Isn't So (1).mp3.mpeg",
                "image": "assets/andromeda/songs/the-outfield-say-it-isn-t-so.svg?v=2"
            },
            {
                "title": "All The Love In The World",
                "artist": "The Outfield",
                "audio": "Canciones/The Outfield - All The Love In The World (1).mp3.mpeg",
                "image": "assets/andromeda/songs/the-outfield-all-the-love-in-the-world.svg?v=2"
            }
        ]
    },
    "madonna": {
        "name": "Madonna",
        "genre": "Pop · Dance Pop",
        "image": "assets/andromeda/artists/madonna.svg?v=2",
        "bio": "Una de las figuras más influyentes del pop, Madonna ha construido una carrera marcada por la reinvención constante, la música dance y una identidad visual que ha acompañado distintas generaciones.",
        "tags": [
            "Estados Unidos",
            "Desde 1979",
            "Pop"
        ],
        "tracks": [
            {
                "title": "Like A Virgin",
                "artist": "Madonna",
                "audio": "Canciones/Madonna  - Like A Virgin (Lyrics) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/madonna-like-a-virgin.svg?v=2"
            },
            {
                "title": "Hung Up",
                "artist": "Madonna",
                "audio": "Canciones/Madonna - Hung Up (Official Video) [HD] (1).mp3.mpeg",
                "image": "assets/andromeda/songs/madonna-hung-up.svg?v=2"
            },
            {
                "title": "Like a Prayer",
                "artist": "Madonna",
                "audio": "Canciones/Madonna - Like a Prayer (7  Version) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/madonna-like-a-prayer.svg?v=2"
            },
            {
                "title": "Material Girl",
                "artist": "Madonna",
                "audio": "Canciones/Madonna - Material Girl (1).mp3.mpeg",
                "image": "assets/andromeda/songs/madonna-material-girl.svg?v=2"
            }
        ]
    },
    "queen": {
        "name": "Queen",
        "genre": "Rock",
        "image": "assets/andromeda/artists/queen.svg?v=2",
        "bio": "Explora la selección de Queen en ANDROMEDA. Sus canciones disponibles se reúnen aquí para escucharlas, guardarlas y volver a ellas.",
        "tags": [
            "Rock",
            "5 canciones"
        ],
        "tracks": [
            {
                "title": "Another One Bites the Dust",
                "artist": "Queen",
                "audio": "Canciones/Queen - Another One Bites the Dust (Official Video Remastered) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/queen-another-one-bites-the-dust.svg?v=2"
            },
            {
                "title": "Don't Stop Me Now",
                "artist": "Queen",
                "audio": "Canciones/Queen - Don't Stop Me Now (Official Video) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/queen-don-t-stop-me-now.svg?v=2"
            },
            {
                "title": "We Are The Champions",
                "artist": "Queen",
                "audio": "Canciones/Queen - We Are The Champions (Official Video Remastered) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/queen-we-are-the-champions.svg?v=2"
            },
            {
                "title": "We Will Rock You",
                "artist": "Queen",
                "audio": "Canciones/Queen - We Will Rock You (Lyrics) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/queen-we-will-rock-you.svg?v=2"
            },
            {
                "title": "Bohemian Rhapsody",
                "artist": "Queen",
                "audio": "Canciones/Queen – Bohemian Rhapsody (Official Video Remastered) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/queen-bohemian-rhapsody.svg?v=2"
            }
        ]
    },
    "alan-walker": {
        "name": "Alan Walker",
        "genre": "Electrónica",
        "image": "assets/andromeda/artists/alan-walker.svg?v=2",
        "bio": "Explora la selección de Alan Walker en ANDROMEDA. Sus canciones disponibles se reúnen aquí para escucharlas, guardarlas y volver a ellas.",
        "tags": [
            "Electrónica",
            "4 canciones"
        ],
        "tracks": [
            {
                "title": "Alone",
                "artist": "Alan Walker",
                "audio": "Canciones/Alan Walker - Alone (1).mp3.mpeg",
                "image": "assets/andromeda/songs/alan-walker-alone.svg?v=2"
            },
            {
                "title": "Faded",
                "artist": "Alan Walker",
                "audio": "Canciones/Alan Walker - Faded (1).mp3.mpeg",
                "image": "assets/andromeda/songs/alan-walker-faded.svg?v=2"
            },
            {
                "title": "Sing Me To Sleep",
                "artist": "Alan Walker",
                "audio": "Canciones/Alan Walker - Sing Me To Sleep (1).mp3.mpeg",
                "image": "assets/andromeda/songs/alan-walker-sing-me-to-sleep.svg?v=2"
            },
            {
                "title": "The Spectre",
                "artist": "Alan Walker",
                "audio": "Canciones/Alan Walker - The Spectre (1).mp3.mpeg",
                "image": "assets/andromeda/songs/alan-walker-the-spectre.svg?v=2"
            }
        ]
    },
    "the-notorious-b-i-g": {
        "name": "The Notorious B.I.G.",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/the-notorious-b-i-g.svg?v=2",
        "bio": "Narración, cadencia y una voz profunda que dejó huella en el hip hop.",
        "tags": [
            "Hip Hop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Big Poppa",
                "artist": "The Notorious B.I.G.",
                "audio": "Canciones/the-notorious-b-i-g-big-poppa.mp3",
                "image": "assets/andromeda/songs/the-notorious-b-i-g-big-poppa.svg?v=2"
            }
        ]
    },
    "george-michael": {
        "name": "George Michael",
        "genre": "Pop",
        "image": "assets/andromeda/artists/george-michael.svg?v=2",
        "bio": "Una voz expresiva que conecta el pop con el soul y las baladas.",
        "tags": [
            "Pop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Careless Whisper",
                "artist": "George Michael",
                "audio": "Canciones/george-michael-careless-whisper.mp3",
                "image": "assets/andromeda/songs/george-michael-careless-whisper.svg?v=2"
            }
        ]
    },
    "dr-dre": {
        "name": "Dr. Dre",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/dr-dre.svg?v=2",
        "bio": "Ritmos de la Costa Oeste y una producción que acompaña algunas de las voces más reconocidas del hip hop.",
        "tags": [
            "Hip Hop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Still D.R.E.",
                "artist": "Dr. Dre feat. Snoop Dogg",
                "audio": "Canciones/dr-dre-still-d-r-e.mp3",
                "image": "assets/andromeda/songs/dr-dre-still-d-r-e.svg?v=2"
            }
        ]
    },
    "luis-miguel": {
        "name": "Luis Miguel",
        "genre": "Romántica",
        "image": "assets/andromeda/artists/luis-miguel.svg?v=2",
        "bio": "Baladas, boleros y pop en español reunidos alrededor de una voz reconocible entre generaciones.",
        "tags": [
            "Romántica",
            "5 canciones"
        ],
        "tracks": [
            {
                "title": "Sabor a Mí",
                "artist": "Luis Miguel",
                "audio": "Canciones/luis-miguel-sabor-a-mi.mp3",
                "image": "assets/andromeda/songs/luis-miguel-sabor-a-mi.svg?v=2"
            },
            {
                "title": "Ahora te puedes marchar",
                "artist": "Luis Miguel",
                "audio": "Canciones/luis-miguel-ahora-te-puedes-marchar.mp3",
                "image": "assets/andromeda/songs/luis-miguel-ahora-te-puedes-marchar.svg?v=2"
            },
            {
                "title": "La Incondicional",
                "artist": "Luis Miguel",
                "audio": "Canciones/luis-miguel-la-incondicional.mp3",
                "image": "assets/andromeda/songs/luis-miguel-la-incondicional.svg?v=2"
            },
            {
                "title": "Culpable o no (Miénteme como siempre)",
                "artist": "Luis Miguel",
                "audio": "Canciones/luis-miguel-culpable-o-no-mienteme-como-siempre.mp3",
                "image": "assets/andromeda/songs/luis-miguel-culpable-o-no-mienteme-como-siempre.svg?v=2"
            },
            {
                "title": "La mentira",
                "artist": "Luis Miguel",
                "audio": "Canciones/luis-miguel-la-mentira.mp3",
                "image": "assets/andromeda/songs/luis-miguel-la-mentira.svg?v=2"
            }
        ]
    },
    "chicago": {
        "name": "Chicago",
        "genre": "Rock",
        "image": "assets/andromeda/artists/chicago.svg?v=2",
        "bio": "Arreglos melódicos y baladas de rock para escuchar con calma.",
        "tags": [
            "Rock",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Hard to Say I’m Sorry",
                "artist": "Chicago",
                "audio": "Canciones/chicago-hard-to-say-im-sorry.mp3",
                "image": "assets/andromeda/songs/chicago-hard-to-say-im-sorry.svg?v=2"
            }
        ]
    },
    "lady-gaga": {
        "name": "Lady Gaga",
        "genre": "Pop",
        "image": "assets/andromeda/artists/lady-gaga.svg?v=2",
        "bio": "Pop, dance y una identidad artística marcada por la teatralidad y la reinvención.",
        "tags": [
            "Pop",
            "4 canciones"
        ],
        "tracks": [
            {
                "title": "Paparazzi",
                "artist": "Lady Gaga",
                "audio": "Canciones/lady-gaga-paparazzi.mp3",
                "image": "assets/andromeda/songs/lady-gaga-paparazzi.svg?v=2"
            },
            {
                "title": "Poker Face",
                "artist": "Lady Gaga",
                "audio": "Canciones/lady-gaga-poker-face.mp3",
                "image": "assets/andromeda/songs/lady-gaga-poker-face.svg?v=2"
            },
            {
                "title": "Bad Romance",
                "artist": "Lady Gaga",
                "audio": "Canciones/lady-gaga-bad-romance.mp3",
                "image": "assets/andromeda/songs/lady-gaga-bad-romance.svg?v=2"
            },
            {
                "title": "Just Dance",
                "artist": "Lady Gaga feat. Colby O’Donis",
                "audio": "Canciones/lady-gaga-just-dance.mp3",
                "image": "assets/andromeda/songs/lady-gaga-just-dance.svg?v=2"
            }
        ]
    },
    "50-cent": {
        "name": "50 Cent",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/50-cent.svg?v=2",
        "bio": "Rap de pulso directo, estribillos reconocibles y el sonido de club de sus grandes éxitos.",
        "tags": [
            "Hip Hop",
            "4 canciones"
        ],
        "tracks": [
            {
                "title": "Candy Shop",
                "artist": "50 Cent feat. Olivia",
                "audio": "Canciones/50-cent-candy-shop.mp3",
                "image": "assets/andromeda/songs/50-cent-candy-shop.svg?v=2"
            },
            {
                "title": "P.I.M.P.",
                "artist": "50 Cent",
                "audio": "Canciones/50-cent-p-i-m-p.mp3",
                "image": "assets/andromeda/songs/50-cent-p-i-m-p.svg?v=2"
            },
            {
                "title": "21 Questions",
                "artist": "50 Cent feat. Nate Dogg",
                "audio": "Canciones/50-cent-21-questions.mp3",
                "image": "assets/andromeda/songs/50-cent-21-questions.svg?v=2"
            },
            {
                "title": "In Da Club",
                "artist": "50 Cent",
                "audio": "Canciones/50-cent-in-da-club.mp3",
                "image": "assets/andromeda/songs/50-cent-in-da-club.svg?v=2"
            }
        ]
    },
    "wiz-khalifa-snoop-dogg": {
        "name": "Wiz Khalifa & Snoop Dogg",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/wiz-khalifa-snoop-dogg.svg?v=2",
        "bio": "Dos voces unidas por un flow relajado y una atmósfera de hip hop de la Costa Oeste.",
        "tags": [
            "Hip Hop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "That Good",
                "artist": "Wiz Khalifa & Snoop Dogg",
                "audio": "Canciones/wiz-khalifa-snoop-dogg-that-good.mp3",
                "image": "assets/andromeda/songs/wiz-khalifa-snoop-dogg-that-good.svg?v=2"
            }
        ]
    },
    "ice-cube": {
        "name": "Ice Cube",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/ice-cube.svg?v=2",
        "bio": "Un referente del hip hop de la Costa Oeste, con relatos urbanos y una presencia vocal inconfundible.",
        "tags": [
            "Hip Hop",
            "2 canciones"
        ],
        "tracks": [
            {
                "title": "It Was a Good Day",
                "artist": "Ice Cube",
                "audio": "Canciones/ice-cube-it-was-a-good-day.mp3",
                "image": "assets/andromeda/songs/ice-cube-it-was-a-good-day.svg?v=2"
            },
            {
                "title": "You Know How We Do It",
                "artist": "Ice Cube",
                "audio": "Canciones/ice-cube-you-know-how-we-do-it.mp3",
                "image": "assets/andromeda/songs/ice-cube-you-know-how-we-do-it.svg?v=2"
            }
        ]
    },
    "eminem": {
        "name": "Eminem",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/eminem.svg?v=2",
        "bio": "Una voz incisiva y un estilo de rap que combina energía, narración y juegos de palabras.",
        "tags": [
            "Hip Hop",
            "4 canciones"
        ],
        "tracks": [
            {
                "title": "Superman",
                "artist": "Eminem feat. Dina Rae",
                "audio": "Canciones/eminem-superman.mp3",
                "image": "assets/andromeda/songs/eminem-superman.svg?v=2"
            },
            {
                "title": "Lose Yourself",
                "artist": "Eminem",
                "audio": "Canciones/eminem-lose-yourself.mp3",
                "image": "assets/andromeda/songs/eminem-lose-yourself.svg?v=2"
            },
            {
                "title": "Stan",
                "artist": "Eminem feat. Dido",
                "audio": "Canciones/eminem-stan.mp3",
                "image": "assets/andromeda/songs/eminem-stan.svg?v=2"
            },
            {
                "title": "The Real Slim Shady",
                "artist": "Eminem",
                "audio": "Canciones/eminem-the-real-slim-shady.mp3",
                "image": "assets/andromeda/songs/eminem-the-real-slim-shady.svg?v=2"
            }
        ]
    },
    "coolio": {
        "name": "Coolio",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/coolio.svg?v=2",
        "bio": "Rap melódico y relatos urbanos presentes en esta selección de ANDROMEDA.",
        "tags": [
            "Hip Hop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Gangsta’s Paradise",
                "artist": "Coolio feat. L.V.",
                "audio": "Canciones/coolio-gangstas-paradise.mp3",
                "image": "assets/andromeda/songs/coolio-gangstas-paradise.svg?v=2"
            }
        ]
    },
    "snoop-dogg": {
        "name": "Snoop Dogg",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/snoop-dogg.svg?v=2",
        "bio": "Flow relajado, ritmos de la Costa Oeste y colaboraciones llenas de personalidad.",
        "tags": [
            "Hip Hop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Drop It Like It’s Hot",
                "artist": "Snoop Dogg feat. Pharrell Williams",
                "audio": "Canciones/snoop-dogg-drop-it-like-its-hot.mp3",
                "image": "assets/andromeda/songs/snoop-dogg-drop-it-like-its-hot.svg?v=2"
            }
        ]
    },
    "2pac-pop-smoke": {
        "name": "2Pac & Pop Smoke",
        "genre": "Hip Hop",
        "image": "assets/andromeda/artists/2pac-pop-smoke.svg?v=2",
        "bio": "Mashup de Thug Theory con 2Pac, Pop Smoke, Biggie, DMX, Eazy-E, Ice Cube, Dr. Dre, N.W.A., Nipsey Hussle y Snoop Dogg.",
        "tags": [
            "Hip Hop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Write This Down (Mashup)",
                "artist": "2Pac & Pop Smoke",
                "audio": "Canciones/2pac-pop-smoke-write-this-down-mashup.mp3",
                "image": "assets/andromeda/songs/2pac-pop-smoke-write-this-down-mashup.svg?v=2"
            }
        ]
    },
    "wham": {
        "name": "Wham!",
        "genre": "Pop",
        "image": "assets/andromeda/artists/wham.svg?v=2",
        "bio": "Pop luminoso y melodías que siguen acompañando distintas generaciones.",
        "tags": [
            "Pop",
            "1 canciones"
        ],
        "tracks": [
            {
                "title": "Last Christmas",
                "artist": "Wham!",
                "audio": "Canciones/wham-last-christmas.mp3",
                "image": "assets/andromeda/songs/wham-last-christmas.svg?v=2"
            }
        ]
    },
    "axl-rose": {
        "name": "Axl Rose",
        "genre": "Rock · Hard Rock",
        "image": "assets/andromeda/artists/axl-rose.svg?v=2",
        "bio": "Voz principal de Guns N' Roses y una de las figuras más reconocibles del hard rock. Su potencia vocal, presencia escénica y estilo convirtieron al grupo en un referente mundial.",
        "tags": [
            "Estados Unidos",
            "Guns N' Roses",
            "Hard Rock"
        ],
        "tracks": [
            {
                "title": "Knockin' On Heaven's Door",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - Knockin' On Heaven's Door (Visualizer).mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-knockin-on-heaven-s-door.svg?v=2"
            },
            {
                "title": "Don't Cry",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - Don't Cry (Lyrics) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-don-t-cry.svg?v=2"
            },
            {
                "title": "Sweet Child O' Mine",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - Sweet Child O' Mine (Official Music Video) - GunsNRosesVEVO.mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-sweet-child-o-mine.svg?v=2"
            },
            {
                "title": "November Rain",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - November Rain - GunsNRosesVEVO.mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-november-rain.svg?v=2"
            },
            {
                "title": "Welcome To The Jungle",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - Welcome To The Jungle (1).mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-welcome-to-the-jungle.svg?v=2"
            },
            {
                "title": "Paradise City",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - Paradise City (Official Music Video) (1).mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-paradise-city.svg?v=2"
            },
            {
                "title": "Patience",
                "artist": "Guns N' Roses",
                "audio": "Canciones/Guns N' Roses - Patience (1).mp3.mpeg",
                "image": "assets/andromeda/songs/guns-n-roses-patience.svg?v=2"
            }
        ]
    }
};

    /* ========================================
       ELEMENTOS
    ======================================== */

    const searchInput = root.querySelector("#artistSearch");

    const filters = [
        ...root.querySelectorAll(".artist-filter")
    ];

    const cards = [
        ...root.querySelectorAll(".artist-catalog-card")
    ];


/* ========================================
   IMAGEN DEL ARTISTA EN TARJETAS
======================================== */

cards.forEach(card => {
    const artistId = card.dataset.artistId;
    const profile = artistProfiles[artistId];
    const playButton = card.querySelector(".artist-song-play");

    if (!profile || !playButton || !profile.image) {
        return;
    }

    playButton.dataset.image = profile.image;
    const portrait = card.querySelector('.artist-catalog-image img');
    if (portrait) portrait.src = profile.image;
});
    const resultCount = root.querySelector("#artistResultCount");
    const emptyState = root.querySelector("#artistsEmpty");

    const overlay = root.querySelector("#artistProfileOverlay");
    const profileContent = root.querySelector("#artistProfileContent");

    const status = root.querySelector("#artistStatus");

    const audio = document.getElementById("audioPlayer");
    const playerTitle = document.getElementById("playerTitle");
    const playerArtist = document.getElementById("playerArtist");
    const playerCover = document.getElementById("playerCover");

    let activeGenre = "all";
    let lastFocusedElement = null;
    let followed = new Set();
    let ownedSource = "";
    let playRequest = 0;

    /* ========================================
       ARTISTAS SEGUIDOS
    ======================================== */

    try {
        const saved = JSON.parse(
            localStorage.getItem("sonora-followed-artists") || "[]"
        );

        if (Array.isArray(saved)) {
            followed = new Set(
                saved.filter(id => artistProfiles[id])
            );
        }
    } catch (_) {}

    const notify = message => {
        if (status) {
            status.textContent = message;
        }
    };

    const absolute = path =>
        new URL(path, location.href).href;




    /* ========================================
       COLA GLOBAL DE CANCIONES
    ======================================== */

    const queue = Object.values(artistProfiles)
    .flatMap(profile => {
        const tracks =
            profile.tracks ||
            (profile.track ? [profile.track] : []);

        return tracks.map(track => ({
            ...track,
            artist: track.artist || profile.name,

            // Artistas siempre usa la imagen principal del artista
            image: profile.image || track.image || ""
        }));
    });
    /* ========================================
       SINCRONIZAR REPRODUCCIÓN
    ======================================== */

    function syncPlayback() {
        root.querySelectorAll(".artist-song-play")
            .forEach(button => {
                if (!button.dataset.audio) return;

                const playing =
                    audio &&
                    absolute(button.dataset.audio) === audio.src &&
                    !audio.paused &&
                    !audio.ended;

                button.setAttribute(
                    "aria-pressed",
                    String(Boolean(playing))
                );

                button.setAttribute(
                    "aria-label",
                    (
                        playing
                            ? "Pausar "
                            : "Reproducir "
                    ) + (button.dataset.title || "canción")
                );

                const icon = button.querySelector("i");

                if (icon) {
                    icon.className = playing
                        ? "bi bi-pause-fill"
                        : "bi bi-play-fill";
                }

                const label =
                    button.querySelector("[data-play-label]");

                if (label) {
                    label.textContent = playing
                        ? "Pausar"
                        : "Escuchar ahora";
                }
            });

        if (
            audio &&
            ownedSource === audio.src
        ) {
            const main =
                document.getElementById("mainPlayBtn");

            const icon =
                main?.querySelector("i");

            if (icon) {
                icon.className = audio.paused
                    ? "bi bi-play-fill"
                    : "bi bi-pause-fill";
            }

            main?.setAttribute(
                "aria-label",
                audio.paused
                    ? "Reproducir"
                    : "Pausar"
            );
        }
    }

    /* ========================================
       ARTISTA DESTACADO — CARRUSEL
    ======================================== */

    const featuredRoot =
        root.querySelector("[data-featured-carousel]");

    let featuredTimer = null;
    let featuredIndex = 0;
    let featuredPaused = false;
    let featuredInView = true;

    const featuredDelay = 8000;

    /* ========================================
       ARTISTAS DEL CARRUSEL
    ======================================== */

    const featuredIds = ["the-police", "scorpions", "eiffel-65", "the-outfield", "madonna", "queen", "alan-walker", "the-notorious-b-i-g", "george-michael", "dr-dre", "luis-miguel", "chicago", "lady-gaga", "50-cent", "wiz-khalifa-snoop-dogg", "ice-cube", "eminem", "coolio", "snoop-dogg", "2pac-pop-smoke", "wham", "axl-rose"];

    /* ========================================
       ORDEN SEGÚN UNIVERSO
    ======================================== */

    const themeFeatured = {"electronic": ["alan-walker", "eiffel-65"], "rock": ["scorpions", "axl-rose", "queen", "the-police", "chicago", "the-outfield"], "pop": ["lady-gaga", "madonna", "george-michael", "wham"], "hiphop": ["eminem", "50-cent", "snoop-dogg", "ice-cube", "dr-dre", "coolio", "the-notorious-b-i-g", "2pac-pop-smoke", "wiz-khalifa-snoop-dogg"], "aurora": ["luis-miguel", "george-michael", "chicago", "scorpions"]};

    function getFeaturedOrder() {
        const theme =
            document.body.dataset.theme ||
            "electronic";

        return themeFeatured[theme] || featuredIds;
    }

    /* ========================================
       CANCIÓN PRINCIPAL
    ======================================== */

    function getFeaturedTrack(profile) {
        if (!profile) return null;

        return (
            profile.tracks?.[0] ||
            profile.track ||
            null
        );
    }

    /* ========================================
       UNIVERSO DEL ARTISTA
    ======================================== */

    function getUniverse(profile) {
        const genre =
            (profile?.genre || "").toLowerCase();

        if (genre.includes("electr")) {
            return "Electronic";
        }

        if (genre.includes("pop")) {
            return "Pop";
        }

        if (genre.includes("hip")) {
            return "Hip Hop";
        }

        if (genre.includes("románt") || genre.includes("romant")) return "Aurora";
        return "Rock";
    }

    /* ========================================
       MOSTRAR ARTISTA DESTACADO
    ======================================== */

    function renderFeatured(
        id,
        direction = 1,
        immediate = false
    ) {
        if (!featuredRoot) return;

        const profile = artistProfiles[id];
        const track = getFeaturedTrack(profile);

        if (!profile || !track) return;

        const image =
            featuredRoot.querySelector("[data-featured-image]");

        const name =
            featuredRoot.querySelector("[data-featured-name]");

        const ghost =
            featuredRoot.querySelector("[data-featured-ghost]");

        const genre =
            featuredRoot.querySelector("[data-featured-genre]");

        const bio =
            featuredRoot.querySelector("[data-featured-bio]");

        const trackName =
            featuredRoot.querySelector("[data-featured-track]");

        const universe =
            featuredRoot.querySelector("[data-featured-universe]");

        const number =
            featuredRoot.querySelector("[data-featured-number]");

        const current =
            featuredRoot.querySelector("[data-featured-index]");

        const total =
            featuredRoot.querySelector("[data-featured-total]");

        const play =
            featuredRoot.querySelector("[data-featured-play]");

        const profileButton =
            featuredRoot.querySelector("[data-featured-profile]");

        const order = getFeaturedOrder();

        const position =
            Math.max(0, order.indexOf(id));

        featuredRoot.dataset.artistId = id;

        featuredRoot.dataset.direction =
            direction > 0 ? "next" : "prev";

        /* ANIMACIÓN */

        if (!immediate) {
            featuredRoot.classList.remove(
                "featured-enter"
            );

            void featuredRoot.offsetWidth;

            featuredRoot.classList.add(
                "featured-enter"
            );
        }

        /*
         * IMPORTANTE:
         * el carrusel prioriza profile.image.
         *
         * De esta forma puedes tener:
         *
         * profile.image = foto ANDROMEDA del artista
         * track.image   = portada de la canción
         */

        if (image) {
            image.src =
                profile.image ||
                track.image ||
                "";

            image.alt = profile.name;
        }

        if (name) {
            name.textContent = profile.name;
        }

        if (ghost) {
            ghost.textContent =
                profile.name.toUpperCase();
        }

        if (genre) {
            genre.textContent =
                profile.genre.toUpperCase();
        }

        if (bio) {
            bio.textContent = profile.bio;
        }

        if (trackName) {
            trackName.textContent =
                track.title;
        }

        if (universe) {
            universe.textContent =
                getUniverse(profile);
        }

        if (number) {
            number.textContent =
                String(position + 1)
                    .padStart(2, "0");
        }

        if (current) {
            current.textContent =
                String(position + 1)
                    .padStart(2, "0");
        }

        if (total) {
            total.textContent =
                String(order.length)
                    .padStart(2, "0");
        }

        /* BOTÓN PLAY */

        if (play) {
            play.dataset.title =
                track.title;

            play.dataset.artist =
                track.artist ||
                profile.name;

            play.dataset.audio =
                track.audio;

            /*
             * El reproductor sí utiliza
             * la portada de la canción.
             */
            play.dataset.image =
            profile.image ||
                track.image ||
                
                "";
        }

        /* BOTÓN PERFIL */

        if (profileButton) {
            profileButton.dataset.artistId = id;
        }

        const featuredFollow = featuredRoot.querySelector('[data-featured-follow]');
        if (featuredFollow) featuredFollow.dataset.follow = id;
        syncFollow();
        syncPlayback();
        restartFeaturedProgress();
    }

    /* ========================================
       PROGRESO DEL CARRUSEL
    ======================================== */

    function restartFeaturedProgress() {
        if (!featuredRoot) return;

        window.clearTimeout(featuredTimer);

        const shouldPause = featuredPaused || !featuredInView || document.hidden;
        const bar =
            featuredRoot.querySelector(
                "[data-featured-progress]"
            );

        if (bar) {
            bar.style.animation = "none";

            void bar.offsetWidth;

            bar.style.animation =
                shouldPause
                    ? "none"
                    : `sonoraFeaturedProgress ${featuredDelay}ms linear forwards`;
        }

        if (!shouldPause) {
            featuredTimer =
                window.setTimeout(
                    () => changeFeatured(1),
                    featuredDelay
                );
        }
    }

    /* ========================================
       CAMBIAR ARTISTA
    ======================================== */

    function changeFeatured(step) {
        const order = getFeaturedOrder();

        if (!order.length) return;

        /*
         * Calculamos la posición actual
         * usando el artista realmente mostrado.
         * Esto evita errores después de cambiar
         * de universo.
         */

        const currentId =
            featuredRoot?.dataset.artistId;

        const actualIndex =
            order.indexOf(currentId);

        if (actualIndex !== -1) {
            featuredIndex = actualIndex;
        }

        featuredIndex =
            (
                featuredIndex +
                step +
                order.length
            ) % order.length;

        renderFeatured(
            order[featuredIndex],
            step
        );
    }

    /* ========================================
       CAMBIO DE UNIVERSO
    ======================================== */

    function syncFeaturedToTheme() {
        const order = getFeaturedOrder();

        if (!order.length) return;

        featuredIndex = 0;

        renderFeatured(
            order[0],
            1,
            true
        );
    }

    /* ========================================
       EVENTOS DEL CARRUSEL
    ======================================== */

    if (featuredRoot) {
        on(
            featuredRoot.querySelector(
                "[data-featured-prev]"
            ),
            "click",
            event => {
                event.preventDefault();
                changeFeatured(-1);
            }
        );

        on(
            featuredRoot.querySelector(
                "[data-featured-next]"
            ),
            "click",
            event => {
                event.preventDefault();
                changeFeatured(1);
            }
        );

        /* PAUSAR CON MOUSE */

        on(
            featuredRoot,
            "mouseenter",
            () => {
                featuredPaused = true;

                window.clearTimeout(
                    featuredTimer
                );

                const bar =
                    featuredRoot.querySelector(
                        "[data-featured-progress]"
                    );

                if (bar) {
                    bar.style.animationPlayState =
                        "paused";
                }
            }
        );

        /* REANUDAR */

        on(
            featuredRoot,
            "mouseleave",
            () => {
                featuredPaused = false;
                restartFeaturedProgress();
            }
        );

        /* PAUSAR CON TECLADO */

        on(
            featuredRoot,
            "focusin",
            () => {
                featuredPaused = true;

                window.clearTimeout(
                    featuredTimer
                );

                const bar =
                    featuredRoot.querySelector(
                        "[data-featured-progress]"
                    );

                if (bar) {
                    bar.style.animationPlayState =
                        "paused";
                }
            }
        );

        on(
            featuredRoot,
            "focusout",
            event => {
                if (
                    !featuredRoot.contains(
                        event.relatedTarget
                    )
                ) {
                    featuredPaused = false;
                    restartFeaturedProgress();
                }
            }
        );

        const viewportObserver = new IntersectionObserver(entries => {
            featuredInView = entries[0].isIntersecting;
            restartFeaturedProgress();
        });
        viewportObserver.observe(featuredRoot);
        on(document, 'visibilitychange', restartFeaturedProgress);
        controller.signal.addEventListener('abort', () => viewportObserver.disconnect());

        /* OBSERVAR UNIVERSO */

        const themeObserver =
            new MutationObserver(
                mutations => {
                    const changed =
                        mutations.some(
                            mutation =>
                                mutation.attributeName ===
                                "data-theme"
                        );

                    if (changed) {
                        syncFeaturedToTheme();
                    }
                }
            );

        themeObserver.observe(
            document.body,
            {
                attributes: true,
                attributeFilter: [
                    "data-theme"
                ]
            }
        );

        controller.signal.addEventListener(
            "abort",
            () => {
                themeObserver.disconnect();

                window.clearTimeout(
                    featuredTimer
                );
            }
        );

        syncFeaturedToTheme();
    }

    /* ========================================
       SEGUIR ARTISTAS
    ======================================== */

    function syncFollow() {
        root.querySelectorAll("[data-follow]")
            .forEach(button => {
                const active =
                    followed.has(
                        button.dataset.follow
                    );

                button.textContent = active
                    ? "✓ Siguiendo"
                    : "+ Seguir";

                button.setAttribute(
                    "aria-pressed",
                    String(active)
                );

                const profile =
                    artistProfiles[
                        button.dataset.follow
                    ];

                if (profile) {
                    button.setAttribute(
                        "aria-label",
                        (
                            active
                                ? "Dejar de seguir a "
                                : "Seguir a "
                        ) + profile.name
                    );
                }
            });
    }

    cards.forEach(card => {
        const info =
            card.querySelector(
                ".artist-catalog-info"
            );

        if (!info) return;

        /*
         * Evita duplicar el botón si
         * initArtistas se ejecuta otra vez.
         */

        if (
            info.querySelector("[data-follow]")
        ) {
            return;
        }

        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "artist-follow";

        button.dataset.follow =
            card.dataset.artistId;

        info.append(button);
    });

    /* ========================================
       IMÁGENES NO DISPONIBLES
    ======================================== */

    function imageFallback(event) {
        const img = event.target;

        if (
            !img ||
            img.tagName !== "IMG"
        ) {
            return;
        }

        img.hidden = true;

        img.parentElement?.classList.add(
            "artist-image-unavailable"
        );

        if (img.parentElement) {
            img.parentElement.dataset.initial =
                (img.alt || "S").slice(0, 1);
        }
    }

    on(
        root,
        "error",
        imageFallback,
        { capture: true }
    );

    root.querySelectorAll("img")
        .forEach(img => {
            if (
                img.complete &&
                !img.naturalWidth
            ) {
                imageFallback({
                    target: img
                });
            }
        });

    /* ========================================
       BÚSQUEDA Y FILTROS
    ======================================== */

    function normalize(value) {
        return (value || "")
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim();
    }

    function filterArtists() {
        const query =
            normalize(searchInput?.value);

        let visible = 0;

        cards.forEach(card => {
            const name =
                normalize(
                    card.dataset.name
                );

            const genreLabel =
                card.querySelector(
                    ".artist-catalog-info > span"
                )?.textContent || "";

            const genres =
                normalize(
                    `${
                        card.dataset.genre || ""
                    } ${genreLabel}`
                );

            const matchesQuery =
                !query ||
                name.includes(query) ||
                genres.includes(query);

            const matchesGenre =
                activeGenre === "all" ||
                (
                    activeGenre === "following"
                        ? followed.has(
                            card.dataset.artistId
                        )
                        : genres.includes(
                            activeGenre
                        )
                );

            const show =
                matchesQuery &&
                matchesGenre;

            card.hidden = !show;

            if (show) {
                visible++;
            }
        });

        if (resultCount) {
            resultCount.textContent =
                `${visible} ${
                    visible === 1
                        ? "artista"
                        : "artistas"
                }`;
        }

        if (emptyState) {
            emptyState.hidden =
                visible !== 0;
        }

        filters.forEach(item => {
            const active =
                item.dataset.genre ===
                activeGenre;

            item.classList.toggle(
                "active",
                active
            );

            item.setAttribute(
                "aria-pressed",
                String(active)
            );
        });
    }

    filters.forEach(button => {
        on(
            button,
            "click",
            () => {
                activeGenre =
                    button.dataset.genre ||
                    "all";

                filterArtists();
            }
        );
    });

    on(
        searchInput,
        "input",
        filterArtists
    );

    on(
        root.querySelector("#artistReset"),
        "click",
        () => {
            if (searchInput) {
                searchInput.value = "";
            }

            activeGenre = "all";

            filterArtists();

            searchInput?.focus();
        }
    );

    on(
        root.querySelector("#artistSort"),
        "change",
        event => {
            const sorted = [...cards];

            if (
                event.target.value !==
                "editorial"
            ) {
                sorted.sort((a, b) => {
                    const comparison =
                        a.dataset.name.localeCompare(
                            b.dataset.name,
                            "es"
                        );

                    return comparison *
                        (
                            event.target.value ===
                            "za"
                                ? -1
                                : 1
                        );
                });
            }

            const grid =
                root.querySelector(
                    "#artistsGrid"
                );

            sorted.forEach(card => {
                grid?.append(card);
            });
        }
    );

    /* ========================================
       REPRODUCIR / PAUSAR
    ======================================== */

    async function playSong(button) {
        if (
            !audio ||
            !button.dataset.audio
        ) {
            notify(
                "No hay un archivo de audio disponible para esta canción."
            );

            return;
        }

        window.sonoraPlaybackOwner = "artistas";
        const request = ++playRequest;

        notify("");

        const audioUrl =
            new URL(
                button.dataset.audio,
                window.location.href
            ).href;

        ownedSource = audioUrl;

        if (
            audio.src === audioUrl &&
            !audio.paused
        ) {
            audio.pause();
            syncPlayback();
            return;
        }

        if (
            (audio.currentSrc || audio.src) !==
            audioUrl
        ) {
            audio.src =
                button.dataset.audio;

            audio.currentTime = 0;
        }

        if (playerTitle) {
            playerTitle.textContent =
                button.dataset.title ||
                "Canción";
        }

        if (playerArtist) {
            playerArtist.textContent =
                button.dataset.artist ||
                "Artista";
        }

        if (
            playerCover &&
            button.dataset.image
        ) {
            const image =
                document.createElement("img");

            image.src =
                button.dataset.image;

            image.alt =
                button.dataset.title ||
                "Portada";

            playerCover.replaceChildren(
                image
            );
        }

        try {
            await audio.play();

            if (request !== playRequest) {
                return;
            }

            syncPlayback();

            try {
                localStorage.setItem(
                    "sonora-player-state",
                    JSON.stringify({
                        src: audio.src,

                        title:
                            button.dataset.title ||
                            "Canción",

                        artist:
                            button.dataset.artist ||
                            "Artista",

                        image:
                            button.dataset.image ||
                            "",

                        time:
                            audio.currentTime,

                        volume:
                            audio.volume
                    })
                );
            } catch (_) {}

        } catch (error) {
            if (
                request !== playRequest ||
                error.name === "AbortError"
            ) {
                return;
            }

            notify(
                error.name === "NotAllowedError"
                    ? "El navegador bloqueó el audio. Pulsa reproducir para intentarlo de nuevo."
                    : "No se pudo abrir la canción. Comprueba el archivo en la carpeta Canciones."
            );

            syncPlayback();
        }
    }

    /* ========================================
       PERFIL DEL ARTISTA
    ======================================== */

    function openProfile(id, trigger) {
        const profile =
            artistProfiles[id];

        if (
            !profile ||
            !overlay ||
            !profileContent
        ) {
            return;
        }

        lastFocusedElement =
            trigger ||
            document.activeElement;

        /*
         * El perfil utiliza profile.image,
         * igual que el carrusel.
         */

        const portrait =
            profile.image
                ? `
                    <div class="artist-profile-portrait">
                        <img
                            src="${profile.image}"
                            alt="${profile.name}"
                        >
                    </div>
                `
                : `
                    <div class="artist-profile-portrait">
                        <div class="artist-profile-initial">
                            ${profile.initial || "S"}
                        </div>
                    </div>
                `;

        const tracks =
            profile.tracks ||
            (
                profile.track
                    ? [profile.track]
                    : []
            );

        const trackList =
            tracks.length
                ? `
                    <div class="artist-profile-tracks">

                        <h3>
                            ${
                                tracks.length > 1
                                    ? "Canciones destacadas"
                                    : "Canción esencial"
                            }
                        </h3>

                        ${tracks.map(
                            (song, index) => `
                                <div class="artist-profile-track">

                                    <div>
                                        <small>
                                            ${String(index + 1).padStart(2, "0")}
                                        </small>

                                        <strong>
                                            ${song.title}
                                        </strong>
                                    </div>

                                    <button
                                        class="artist-card-play artist-song-play"
                                        type="button"
                                        aria-label="Reproducir ${song.title}"
                                        data-title="${song.title}"
                                        data-artist="${song.artist || profile.name}"
                                        data-audio="${song.audio}"
                                        data-image="${profile.image || song.image || ""}"
                                    >
                                        <i class="bi bi-play-fill"></i>
                                    </button>

                                </div>
                            `
                        ).join("")}

                    </div>
                `
                : `
                    <div class="artist-profile-track">

                        <div>
                            <small>
                                PRÓXIMAMENTE
                            </small>

                            <strong>
                                Nueva música en camino
                            </strong>
                        </div>

                    </div>
                `;

        profileContent.innerHTML = `
            <div class="artist-profile-heading">${portrait}<div class="artist-profile-summary">
            <span class="artist-genre">
                ${profile.genre}
            </span>

            <h2 id="artistProfileName">
                ${profile.name}
            </h2>

            <p class="artist-profile-bio">
                ${profile.bio}
            </p>

            <div class="artist-profile-meta">
                ${(profile.tags || [])
                    .map(
                        tag =>
                            `<span>${tag}</span>`
                    )
                    .join("")}
            </div>

            </div></div>
            ${trackList}
        `;

        const follow =
            document.createElement("button");

        follow.type = "button";
        follow.className = "artist-follow";
        follow.dataset.follow = id;

        profileContent.append(follow);

        syncFollow();
        syncPlayback();

        overlay.classList.add("open");

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "artist-profile-open"
        );

        overlay.querySelector(
            ".artist-profile-close"
        )?.focus();

        const url =
            new URL(window.location.href);

        url.searchParams.set(
            "page",
            "artistas"
        );

        url.searchParams.set(
            "artist",
            id
        );

        history.replaceState(
            {
                page: "artistas",
                artist: id
            },
            "",
            url
        );
    }

    function closeProfile() {
        if (!overlay) return;

        overlay.classList.remove("open");

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "artist-profile-open"
        );

        lastFocusedElement?.focus?.();

        const url =
            new URL(window.location.href);

        url.searchParams.delete("artist");

        history.replaceState(
            {
                page: "artistas"
            },
            "",
            url
        );
    }

    /* ========================================
       CLICK GENERAL
    ======================================== */

    on(
        root,
        "click",
        event => {
            const closeButton =
                event.target.closest(
                    "[data-close-artist-profile]"
                );

            if (closeButton) {
                closeProfile();
                return;
            }

            const follow =
                event.target.closest(
                    "[data-follow]"
                );

            if (follow) {
                const id =
                    follow.dataset.follow;

                if (followed.has(id)) {
                    followed.delete(id);
                } else {
                    followed.add(id);
                }

                try {
                    localStorage.setItem(
                        "sonora-followed-artists",
                        JSON.stringify(
                            [...followed]
                        )
                    );

                    notify(
                        followed.has(id)
                            ? "Artista guardado en Siguiendo."
                            : "Has dejado de seguir a este artista."
                    );
                } catch (_) {
                    notify(
                        "Preferencia aplicada esta vez; el navegador no permitió guardarla."
                    );
                }

                syncFollow();
                filterArtists();

                return;
            }

            const playButton =
                event.target.closest(
                    ".artist-song-play"
                );

            if (playButton) {
                event.preventDefault();

                playSong(playButton);

                return;
            }

            const detailsButton =
                event.target.closest(
                    ".artist-details-button"
                );

            if (detailsButton) {
                openProfile(
                    detailsButton.dataset.artistId,
                    detailsButton
                );
            }
        }
    );

    /* ========================================
       ACCESIBILIDAD PERFIL
    ======================================== */

    on(
        overlay,
        "keydown",
        event => {
            if (
                event.key === "Escape" &&
                overlay.classList.contains("open")
            ) {
                closeProfile();
            }

            if (
                event.key === "Tab" &&
                overlay.classList.contains("open")
            ) {
                const focusable = [
                    ...overlay.querySelectorAll(
                        ".artist-profile-panel button, .artist-profile-panel a"
                    )
                ];

                const first =
                    focusable[0];

                const last =
                    focusable.at(-1);

                if (
                    event.shiftKey &&
                    document.activeElement === first
                ) {
                    event.preventDefault();
                    last?.focus();

                } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                ) {
                    event.preventDefault();
                    first?.focus();
                }
            }
        }
    );

    /* ========================================
       REPRODUCTOR GLOBAL
    ======================================== */

    on(
        document,
        "click",
        event => {
            if (
                !root.isConnected ||
                window.sonoraPlaybackOwner === "biblioteca" ||
                !ownedSource ||
                audio?.src !== ownedSource
            ) {
                return;
            }

            const control =
                event.target.closest(
                    "#mainPlayBtn, #nextBtn, #previousBtn"
                );

            if (!control) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            if (
                control.id ===
                "mainPlayBtn"
            ) {
                if (audio.paused) {
                    audio.play().catch(() => {
                        notify(
                            "No se pudo reproducir el archivo de audio."
                        );
                    });
                } else {
                    audio.pause();
                }

                return;
            }

            if (!queue.length) return;

            let index =
                queue.findIndex(
                    song =>
                        absolute(song.audio) ===
                        audio.src
                );

            if (index < 0) {
                index = 0;
            }

            const direction =
                control.id === "nextBtn"
                    ? 1
                    : -1;

            const next =
                queue[
                    (
                        index +
                        direction +
                        queue.length
                    ) % queue.length
                ];

            if (next) {
                playSong({
                    dataset: next
                });
            }
        },
        { capture: true }
    );

    [
        "play",
        "pause",
        "ended",
        "emptied",
        "loadedmetadata"
    ].forEach(type => {
        on(
            audio,
            type,
            syncPlayback
        );
    });

    on(
        audio,
        "ended",
        event => {
            if (
                !root.isConnected ||
                window.sonoraPlaybackOwner === "biblioteca" ||
                !ownedSource ||
                audio.src !== ownedSource ||
                !queue.length
            ) {
                return;
            }

            event.stopImmediatePropagation();

            let index =
                queue.findIndex(
                    song =>
                        absolute(song.audio) ===
                        audio.src
                );

            if (index < 0) {
                index = 0;
            }

            const next =
                queue[
                    (index + 1) %
                    queue.length
                ];

            if (next) {
                playSong({
                    dataset: next
                });
            }
        },
        { capture: true }
    );

    on(
        audio,
        "error",
        () => {
            if (
                ownedSource ===
                audio?.src
            ) {
                notify(
                    "Audio no disponible. Revisa la ruta y el archivo en Canciones."
                );
            }

            syncPlayback();
        }
    );

    /* ========================================
       LIMPIEZA
    ======================================== */

    const observer =
        new MutationObserver(() => {
            if (!root.isConnected) {
                cleanup();
            }
        });

    if (root.parentNode) {
        observer.observe(
            root.parentNode,
            {
                childList: true
            }
        );
    }

    function cleanup() {
        controller.abort();

        observer.disconnect();

        window.clearTimeout(
            featuredTimer
        );

        document.body.classList.remove(
            "artist-profile-open"
        );
    }

    window.sonoraArtistsCleanup =
        cleanup;

    /* ========================================
       INICIALIZACIÓN
    ======================================== */

    syncFollow();
    syncPlayback();
    filterArtists();

    if (options.initialArtist) {
        window.setTimeout(
            () => {
                if (root.isConnected) {
                    openProfile(
                        options.initialArtist
                    );
                }
            },
            80
        );
    }
}
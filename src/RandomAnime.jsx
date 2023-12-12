import { useEffect, useState } from "react";
import "./App.css";
import ChooseGenre from "./ChooseGenre.jsx";
import ShowAnime from "./ShowAnime.jsx";

import data from "./output.json";

function RandomAnime() {
  const [anime, setAnime] = useState({});
  const [genre, setGenre] = useState({});
  const [allSelectedGenre, setAllGenre] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [hasClicked, setHasClicked] = useState(false);
  const [researchBar, setResearchBar] = useState("");

  useEffect(() => {
    if (anime) {
    } else {
      setAnime({});
    }
  }, []);

  useEffect(() => {
    var requestURL = "https://api.jikan.moe/v4/genres/anime";
    var request = new XMLHttpRequest();
    request.open("GET", requestURL);
    request.responseType = "json";
    request.send();
    request.onload = function () {
      const temp = request.response;
      setGenre(temp.data);
    };
  }, []);

  function handleClick() {
    setAnime({});
    setIsError(false);

    callApiAnime();
  }

  function filterAnimeByGenre(animeList, genresToFilter) {
    // Check if the animeList and genresToFilter are provided
    if (
      !animeList ||
      !genresToFilter ||
      !Array.isArray(animeList) ||
      !Array.isArray(genresToFilter)
    ) {
      console.error("Invalid input. Please provide valid arrays.");
      return [];
    }

    // Filter the anime based on the specified genres
    const filteredAnime = animeList.filter((anime) => {
      // Check if the anime has genres, explicit_genres, themes, or demographics property
      if (
        (anime.genres && Array.isArray(anime.genres)) ||
        (anime.explicit_genres && Array.isArray(anime.explicit_genres)) ||
        (anime.themes && Array.isArray(anime.themes)) ||
        (anime.demographics && Array.isArray(anime.demographics))
      ) {
        // Check if all specified genres are included in the anime's genres, explicit_genres, themes, or demographics
        if (
          genresToFilter.every(
            (genre) =>
              (anime.genres.length > 0 &&
                anime.genres.some((animeGenre) => animeGenre.name === genre)) ||
              (anime.explicit_genres.length > 0 &&
                anime.explicit_genres.some(
                  (animeGenre) => animeGenre.name === genre
                )) ||
              (anime.themes.length > 0 &&
                anime.themes.some((theme) => theme.name === genre)) ||
              (anime.demographics.length > 0 &&
                anime.demographics.some(
                  (demographic) => demographic.name === genre
                ))
          )
        ) {
          return true;
        }
      }

      return false;
    });

    return filteredAnime;
  }

  function callApiAnime() {
    if (allSelectedGenre.length === 0) {
      let nbAlea = Math.floor(Math.random() * data.length);
      setAnime(data[nbAlea]);
    } else {
      let animeFiltered = filterAnimeByGenre(data, allSelectedGenre);
      if (animeFiltered.length === 0) {
        setErrorMessage("No anime found with these genres");
        setIsError(true);
      } else {
        let nbAlea = Math.floor(Math.random() * animeFiltered.length);
        console.log(animeFiltered[nbAlea].id);
        var requestURL =
          "https://api.jikan.moe/v4/anime/" +
          animeFiltered[nbAlea].id +
          "/full";
        var request = new XMLHttpRequest();
        request.open("GET", requestURL);
        request.responseType = "json";
        request.send();
        request.onload = function () {
          const temp = request.response;
          console.log(temp.data);
          setAnime(temp.data);
        };
      }
    }
  }

  const handleInputChange = (event) => {
    setResearchBar(event.target.value);
  };

  return (
    <div>
      <h1 className="MainTitle">Random Anime Picker</h1>
      {!hasClicked ? (
        <>
          <input type="text" value={researchBar} onChange={handleInputChange} />
          <ChooseGenre
            genre={genre}
            allSelectedGenre={allSelectedGenre}
            setAllGenre={setAllGenre}
            research={researchBar}
          />
          <button
            className="picker"
            onClick={() => {
              setAllGenre([]);
              setResearchBar("");
            }}
          >
            Reset
          </button>
          <button className="picker" onClick={handleClick}>
            Search
          </button>
        </>
      ) : (
        <>
          <button className="reroll" onClick={handleClick}>
            Reroll
          </button>
          <button className="back" onClick={() => setHasClicked(false)}>
            {"<"}
          </button>
          {anime && <ShowAnime anime={anime} />}
          {isError ? <h1 className="error">{errorMessage}</h1> : <div></div>}
        </>
      )}
    </div>
  );
}

export default RandomAnime;

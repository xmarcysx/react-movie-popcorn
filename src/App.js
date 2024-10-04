import {useEffect, useState} from "react";
import StarRating from "./StarRating";

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Search({query, setQuery}) {

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    )
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    )
}

function NumResults({movies}) {
    return (
        <p className="num-results">
            Found <strong>{movies?.length}</strong> results
        </p>
    )
}

function Navbar({children}) {

    return (
        <nav className="nav-bar">
            <Logo/>
            {children}
        </nav>
  )
}

function Box({element}) {
    const [isOpen, setIsOpen] = useState(true);
    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && element}
        </div>
    )
}

function MovieList({movies, onSelectMovie}) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie onSelectMovie={onSelectMovie} key={movie.imdbID} movie={movie} />
            ))}
        </ul>
    )
}

function Movie({movie, onSelectMovie}) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`}/>
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>🗓</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    )
}

function WatchedSummary({watched}) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    )
}

function WatchedMovie({movie, onDeleteWatched}) {
    return (
        <li key={movie.imdbID}>
            <img src={movie.poster} alt={`${movie.title} poster`}/>
            <h3>{movie.title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
                <button className='btn-delete' onClick={() => onDeleteWatched(movie.imdbID)}>x</button>
            </div>
        </li>
    )
}

function WatchedMovieList({watched, onDeleteWatched}) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie onDeleteWatched={onDeleteWatched} key={movie.imdbID} movie={movie}/>
            ))}
        </ul>
    )
}

function Main({children}) {
    return (
        <main className="main">
            {children}
        </main>
    )
}

function Loader() {
    return <p className="loader">Loading ...</p>
}

function Error({error}) {
    return <p className="error">{error}</p>
}

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({})
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState(null);

    const isWatched = watched.find(el => el.imdbID === selectedId);

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime, imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre
    } = movie;

    useEffect(function() {
        async function getMovieDetails() {
            setIsLoading(true);
            const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`);
            const data = await res.json();
            setMovie(data);
            setIsLoading(false);
        }
        getMovieDetails();
    }, [selectedId])

    useEffect(function() {
        if (!title) return;
        document.title = `Movie | ${title}`;

        return function() {
            document.title = 'usePopcorn'
        }

    }, [movie])

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(' ').at(0)),
            userRating: userRating
        }
        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    return (
        <div className='details'>
            {isLoading ?
                <Loader/> :
                <>
                    <header>
                        <button className='btn-back' onClick={onCloseMovie}>x</button>
                        <img src={poster} alt={`Poster of ${movie}`}/>
                        <div className="details-overview">
                            {title}
                            <p>{released} &bull; {runtime}</p>
                            <p><span>⭐</span>{imdbRating} IMDb rating</p>
                        </div>
                    </header>
                    <section>
                        {!isWatched && <div className="rating">
                            <StarRating onSetRating={setUserRating} maxRating={10} size={24}></StarRating>
                            {userRating > 0 && <button className="btn-add" onClick={handleAdd}>+ Add to list</button>}
                        </div>}
                        <p><em>{plot}</em></p>
                        <p>Starring by {actors}</p>
                        <p>Directed by{director}</p>
                    </section>
                </>
            }
        </div>
    );
}

const key = "7837dd64";

export default function App() {
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState("Hannah Montana");
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id) {
        setSelectedId(id);
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched(watched => [...watched, movie]);
    }

    function handleDeleteWatched(id) {
        setWatched(watcjed => watched.filter(el => el.imdbID !== id));
    }

    useEffect(() => {
        const controler = new AbortController();

        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(`http://www.omdbapi.com/?apikey=${key}&s=${query}`, {signal: controler.signal});
                const data = await res.json();

                if (data.Response === 'False') {
                    setError(data.Error);
                    setIsLoading(false);
                    setMovies([]);
                    return;
                }

                setMovies(data.Search);
            } finally {
                setIsLoading(false);
            }
        }
        if (!query.length) {
            setMovies([])
            setError('');
            return;
        }

        fetchMovies();

        return function () {
            controler.abort();
        }
    }, [query]);

    return (
        <>
            <Navbar>
                <Search query={query} setQuery={setQuery}/>
                <NumResults movies={movies}/>
            </Navbar>
            <Main>
                <Box element={
                    <>
                    {isLoading ? <Loader/> : <MovieList onSelectMovie={handleSelectMovie} movies={movies}/>}
                    {error && movies.length < 1 && <Error error={error}/>}
                    </>
                }/>
                <Box element={
                    <>
                        {
                            selectedId ? <MovieDetails watched={watched} onAddWatched={handleAddWatched} onCloseMovie={handleCloseMovie} selectedId={selectedId}/> :
                            <>
                                <WatchedSummary watched={watched}/>
                                <WatchedMovieList onDeleteWatched={handleDeleteWatched} watched={watched}/>
                            </>
                        }
                    </>
                }/>
            </Main>
        </>
    );
}
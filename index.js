const API_KEY = "72ddc290";

async function fetchData(title) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${title}`);
        const data = await response.json();
        if (data.Response === "False") {
            alert("Фильм не найден: " + data.Error);
            return null;
        }
        return data;
    } catch (error) {
        console.error("Ошибка при запросе данных:", error);
        alert("Произошла ошибка при запросе данных.");
        return null;
    }
}

document.getElementById('movie-search-button').addEventListener('click', async () => {
    const movieTitleValue = document.getElementById('movie-search-input').value.trim();
    if (!movieTitleValue) {
        alert("Пожалуйста, введите название фильма.");
        return;
    }

    const spinner = document.getElementById('spinner');
    const movieResults = document.querySelector('.search-results');

    spinner.style.display = 'block';
    movieResults.innerHTML = '';

    const movie = await fetchData(movieTitleValue);

    
    spinner.style.display = 'none';

    if (!movie) return;

    
    showToast("success");

    const cardElementTemplate = `
        <div class="card" style="width: 18rem;">
            <img
                src="${movie.Poster !== "N/A" ? movie.Poster : 'placeholder.jpg'}"
                class="card-img-top"
                alt="${movie.Title} movie poster"
            />
            <div class="card-body">
                <h5 class="card-title">${movie.Title}</h5>
                <p class="card-text">${movie.Plot}</p>
                <button
                    class="btn btn-primary"
                    data-movie-title="${movie.Title}"
                    data-movie-poster="${movie.Poster !== "N/A" ? movie.Poster : 'placeholder.jpg'}"
                    data-movie-plot="${movie.Plot}"
                    data-movie-year="${movie.Year}"
                    data-movie-genre="${movie.Genre}"
                    data-movie-actors="${movie.Actors}"
                >
                    Подробнее
                </button>
                <button
                    class="btn btn-${isFavorite(movie.imdbID) ? 'danger' : 'outline-secondary'} mt-2"
                    data-movie-id="${movie.imdbID}"
                >
                    ${isFavorite(movie.imdbID) ? 'Удалить из избранного' : 'Добавить в избранное'}
                </button>
            </div>
        </div>`;

    movieResults.innerHTML = cardElementTemplate;

    
    addEventListenersToMovieCard(movie);
});


function saveToFavorites(movie) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isAlreadyFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);

    if (!isAlreadyFavorite) {
        favorites.push(movie);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showToast("success");
    } else {
        showToast("error"); 
    }
}


function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => fav.imdbID !== movieId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showToast("success");
}


function isFavorite(movieId) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.imdbID === movieId);
}


function addEventListenersToMovieCard(movie) {
    const favoriteButton = document.querySelector(`[data-movie-id="${movie.imdbID}"]`);

   
    const detailButton = document.querySelector('.btn-primary');
    detailButton.addEventListener('click', () => {
        showModal(movie);
    });

    favoriteButton.addEventListener('click', () => {
        const movieId = movie.imdbID;
        if (isFavorite(movieId)) {
            removeFromFavorites(movieId);
            favoriteButton.classList.replace('btn-danger', 'btn-outline-secondary');
            favoriteButton.textContent = 'Добавить в избранное';
        } else {
            saveToFavorites(movie);
            favoriteButton.classList.replace('btn-outline-secondary', 'btn-danger');
            favoriteButton.textContent = 'Удалить из избранного';
        }
    });
}


function showModal(movie) {
    document.querySelector('#exampleModalLabel').textContent = movie.Title;
    document.querySelector('#modalMoviePoster').src = movie.Poster;
    document.querySelector('#modalMoviePoster').alt = `${movie.Title} movie poster`;
    document.querySelector('#modalMovieYear').textContent = movie.Year;
    document.querySelector('#modalMovieGenre').textContent = movie.Genre;
    document.querySelector('#modalMovieActors').textContent = movie.Actors;
    document.querySelector('#modalMovieDescription').textContent = movie.Plot;

    const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
    modal.show();
}


function showToast(type) {
    const toastSuccess = new bootstrap.Toast(document.getElementById('toastSuccess'));
    const toastError = new bootstrap.Toast(document.getElementById('toastError'));

    if (type === "success") {
        toastSuccess.show();
    } else if (type === "error") {
        toastError.show();
    }
}

// this defines the URL for fetching movie data
let url = "http://localhost:3000/films/";

// these are the references to HTML elements
let ulFilms = document.getElementById("films");
let idBuyticket = document.getElementById("buy-ticket");
let movieImg = document.getElementById("poster");
let idTitle = document.getElementById("title");
let idRuntime = document.getElementById("runtime");
let idFilmInfo = document.getElementById("film-info");
let idShowtime = document.getElementById("showtime");
let idTicketnum = document.getElementById("ticket-num");

// this function is used to fetch and display movie data
function grabMovie() {
    fetch(url)
        .then(res => res.json())
        .then(data => {
            ulFilms.innerHTML = "";
            for (values of data) {
                addMovie(values);
            }
        })
        .catch(e => console.log(e.message));
}

// Call grabMovie function(the above function) to fetch and display movies when the script runs
grabMovie();

// this function adds a movie to the list
function addMovie(movies) {
    let remaining = movies.capacity - movies.tickets_sold;
    let movieTitle = movies.title;
    let movieId = movies.id;

    let liFilm = document.createElement("li");
    if (!remaining > 0) {
        liFilm.className = "sold-out";
    }

    ulFilms.appendChild(liFilm);

    let movieSpan = document.createElement("span");
    movieSpan.innerText = movieTitle;
    liFilm.appendChild(movieSpan);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    liFilm.appendChild(deleteButton);

    // this is an event listener for delete button
    deleteButton.addEventListener('click', () => {
        deleteMovie(movies);
    });

    // this is an event listener for clicking on movie title
    movieSpan.addEventListener('click', () => {
        updateDom(movies);
    });

    // If movie id is '1', update the DOM with its information
    if (movies.id === "1") {
        updateDom(movies);
    }
}

// this function updates the DOM with movie information
function updateDom(movies) {
    let remaining = movies.capacity - movies.tickets_sold;
    let movieId = movies.id;
    let availabiity;

    if (remaining > 0) {
        availabiity = "Buy Ticket";
    } else {
        availabiity = "Sold out";
    }

    movieImg.src = movies.poster;
    movieImg.alt = movies.title;
    idTitle.innerText = movies.title;
    idRuntime.innerText = movies.runtime + " minutes";//displays the duration of the movie in minutes
    idFilmInfo.innerText = movies.description;
    idShowtime.innerText = movies.showtime;
    idTicketnum.innerText = remaining;

    // this is an event listener for buy ticket button
    idBuyticket.onclick = () => {
        if (remaining > 0) {
            buyTicket(movies);
        } else {
            console.log("You cannot buy tickets");
        }
    };

    idBuyticket.dataset.movieId = movies.id;
    let button = document.querySelector("[data-movie-id='" + movieId + "']");
    button.innerText = availabiity;
}

// this function is used to buy tickets for a movie
function buyTicket(movies) {
    movies.tickets_sold++;
    let ticketsSold = movies.tickets_sold;
    let requestHeaders = {
        "Content-Type": "application/json"
    };
    let requestBody = {
        "tickets_sold": ticketsSold
    };
    
    // this is a patch request to update tickets sold for the movie
    fetch(url + movies.id, {
            method: "PATCH",
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        })
        .then(res => res.json())
        .then(data => {
            updateDom(data);
            let numberOfTickets = (data.capacity - data.tickets_sold);

            // If there are no more tickets available, refresh movie list
            if (!numberOfTickets > 0) {
                grabMovie();
            }

            let RequestBodyTickets = {
                "film_id": data.id,
                "number_of_tickets": numberOfTickets
            };

            // this is a post request to create tickets
            fetch("http://localhost:3000/tickets", {
                    method: "POST",
                    headers: requestHeaders,
                    body: JSON.stringify(RequestBodyTickets)
                })
                .then(res => res.json())
                .then(data => data)
                .catch(e => console.log(e.message));
        })
        .catch(e => console.log(e.message));
}

// this function is used to delete a movie
function deleteMovie(movie) {
    let requestHeaders = {
        "Content-Type": "application/json"
    };
    let requestBody = {
        "id": movie.id
    };

    // Delete request to remove movie
    fetch(url + movie.id, {
            method: "DELETE",
            headers: requestHeaders,
            body: JSON.stringify(requestBody)
        })
        .then(res => res.json())
        .then(data => grabMovie())
        .catch(e => console.log(e.message));
}
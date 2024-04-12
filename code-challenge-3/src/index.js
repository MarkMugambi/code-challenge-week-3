const baseUrl = 'http://localhost:3000';

async function fetchFirstMovie() {
  const response = await fetch(`${baseUrl}/films/1`);
  const data = await response.json();
  return data;
}

async function fetchMovies() {
  const response = await fetch(`${baseUrl}/films`);
  const data = await response.json();
  return data;
}

function updateMovieDetails(movie) {
  const poster = document.getElementById('poster');
  poster.src = movie.poster;

  const title = document.getElementById('title');
  title.textContent = movie.title;

  const runtime = document.getElementById('runtime');
  runtime.textContent = `${movie.runtime} minutes`;

  const description = document.getElementById('film-info');
  description.textContent = movie.description;

  const showtime = document.getElementById('showtime');
  showtime.textContent = movie.showtime;

  const ticketsAvailable = document.getElementById('ticket-num');
  const numTickets = movie.capacity - movie.tickets_sold;
  ticketsAvailable.textContent = numTickets;

  const buyTicketButton = document.getElementById('buy-ticket');
  buyTicketButton.textContent = numTickets > 0 ? 'Buy Ticket' : 'Sold Out';
  buyTicketButton.disabled = numTickets === 0; // Disable button if sold out

  if (numTickets === 0) {
    const filmItem = document.getElementById(`film-${movie.id}`);
    filmItem.classList.add('sold-out'); // Add sold-out class to menu item
  }
}

function createMovieListItem(movie) {
  const listItem = document.createElement('li');
  listItem.classList.add('film', 'item');
  listItem.id = `film-${movie.id}`;
  listItem.textContent = movie.title;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => deleteMovie(movie.id)); // Add event listener for delete button
  listItem.appendChild(deleteButton);

  return listItem;
}

async function buyTicket(movieId) {
  const ticketsAvailable = document.getElementById('ticket-num');
  const currentTickets = parseInt(ticketsAvailable.textContent, 10);

  if (currentTickets > 0) {
    try {
      // Update movie data on server (PATCH request)
      const updateResponse = await fetch(`${baseUrl}/films/${movieId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickets_sold: currentTickets - 1 })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update ticket count');
      }

      // Create new ticket on server (POST request)
      const ticketData = { film_id: movieId, number_of_tickets: 1 };
      const ticketResponse = await fetch(`${baseUrl}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (ticketResponse.ok) {
        ticketsAvailable.textContent = currentTickets - 1;
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      console.error('Error:', error);
      // Handle errors appropriately, e.g., display error message to user
    }
  }
}

// Bonus Deliverable: Delete Movie
async function deleteMovie(movieId) {
  const response = await fetch(`${baseUrl}/films/${movieId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    const filmItem = document.getElementById(`film-${movieId}`);
    filmItem.remove(); // Remove movie from list
  } else {
    console.error('Error:', error);
    // Handle errors appropriately
  }
}

(async () => {
  const firstMovie = await fetchFirstMovie();
  updateMovieDetails(firstMovie);

  const movies = await fetchMovies();
  const filmList = document.getElementById('films');
  movies.forEach(movie => {
    const listItem = createMovieListItem(movie);
    filmList.appendChild(listItem);
  });

  const buyTicketButton = document.getElementById('buy-ticket');
  buyTicketButton.addEventListener('click', async () => {
    const movieId = 1; // Assuming you're targeting the first movie for purchase (modify if needed)
    await buyTicket(movieId);
  });
})();
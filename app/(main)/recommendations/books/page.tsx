"use client";

import { useEffect, useState, useRef } from "react";

const allGenres = [
  "Դրամա", "Կենսագրություն", "Պոեզիա", "Պատմական գեղարվեստական գրականություն", "Կատակերգություն", "Ռոմանս",
  "Թրիլլեր", "Առեղծված", "Երիտասարդական", "Դետեկտիվ", "Ժամանակակից", "Դիստոպիա", "Սարսափ",
  "Գիտական ֆանտաստիկա", "Արկածային", "Ֆանտաստիկա", "Մանկական գրականություն"
];

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

const FilterPopover = ({
  genres,
  levels,
  selectedGenres,
  setSelectedGenres,
  selectedLevel,
  setSelectedLevel,
  fetchBooks,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !(popoverRef.current as any).contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev: string[]) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="relative inline-block mb-6">
      <button
        className="bg-white px-6 py-2 rounded-full shadow text-sm font-semibold hover:bg-gray-100 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        FILTER
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-3 w-80 bg-white rounded-xl shadow-xl p-4 space-y-4"
        >
          <div>
            <h3 className="text-sm font-medium mb-2">Genres</h3>
            <div className="max-h-32 overflow-y-auto pr-1 flex flex-wrap gap-2">
              {genres.map((genre: string) => {
                const selected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full border text-xs whitespace-nowrap ${
                      selected ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-2">Levels</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level: string) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-4 py-1 rounded-full border text-sm ${
                    selectedLevel === level
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => {
              fetchBooks();
              setIsOpen(false);
            }}
          >
            Get Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

const BooksPage = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("B1");

  const booksPerPage = 10;

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("https://book-api-dh5c.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres: selectedGenres, levels: [selectedLevel] }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const json = await res.json();
      if (json.success) {
        setBooks(json.data);
        setCurrentPage(1);
      } else {
        setError("Failed to load books.");
      }
    } catch (err: any) {
      setError("An error occurred while fetching books.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(books.length / booksPerPage);
  const paginatedBooks = books.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = (totalPages: number, currentPage: number) => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const paginationPages = getPageNumbers(totalPages, currentPage);

  return (
    <div className="p-6 bg-[#fdf4ed] min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Book Recommender</h1>

      {/* Filter Popover */}
      <FilterPopover
        genres={allGenres}
        levels={levels}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        fetchBooks={fetchBooks}
      />

      {/* Error & Loader */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Books */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!loading &&
          !error &&
          paginatedBooks.map((book, idx) => (
            <a
              key={idx}
              href={book["Book URL"]}
              target="_blank"
              rel="noopener noreferrer"
              className="transform hover:scale-105 transition-transform duration-300 block"
            >
              <div className="flex flex-col h-full bg-white shadow-md rounded-xl overflow-hidden border hover:shadow-lg transition duration-300">
                <div className="h-64 w-full overflow-hidden bg-gray-100">
                  <img
                    src={book["Image URL"]}
                    alt={book.Title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between flex-grow p-4">
                  <div>
                    <h2 className="text-lg font-semibold">{book.Title}</h2>
                    <p className="text-gray-600 text-sm">Author: {book.Author}</p>
                    <p className="text-gray-600 text-sm">Genres: {book.Genres}</p>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">Age: {book.Age}+</p>
                </div>
              </div>
            </a>
          ))}
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-10 flex-wrap gap-2 items-center">
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>

          {paginationPages.map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => handlePageClick(page)}
                className={`px-4 py-2 rounded-md border ${
                  currentPage === page ? "bg-gray-900 text-white" : "bg-white hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-2 text-gray-500 font-semibold select-none">...</span>
            )
          )}

          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksPage;

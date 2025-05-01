"use client";

import { useEffect, useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "@/app/(main)/header";
import { Button } from "@/components/ui/button";

type Book = {
  _id: string;
  "Book ID": number;
  Title: string;
  Author: string;
  "Image URL": string;
  "Book URL": string;
  Description: string;
  Age: number;
  Genres: string;
};

const allGenres = [
  "Դրամա", "Կենսագրություն", "Պոեզիա",
  "Պատմական գեղարվեստական գրականություն", "Կատակերգություն", "Ռոմանս", "Թրիլլեր",
  "Առեղծված", "Երիտասարդական", "Դետեկտիվ", "Ժամանակակից", "Դիստոպիա",
  "Սարսափ", "Գիտական ֆանտաստիկա", "Արկածային", "Ֆանտաստիկա",
  "Մանկական գրականություն"
];

const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const booksPerPage = 10;

const getCEFRLevel = (age: number): string => {
  if (age <= 6) return "A1";
  if (age <= 9) return "A2";
  if (age <= 12) return "B1";
  if (age <= 15) return "B2";
  if (age <= 18) return "C1";
  return "C2";
};

const BooksPage = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("/api/bookrec");
        const json = await res.json();
        if (json.success) {
          setBooks(json.data);
        } else {
          setError("Failed to load books.");
        }
      } catch (err) {
        setError("An error occurred while fetching books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
    setCurrentPage(1);
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setCurrentPage(1);
  };

  const filteredBooks = books.filter((book) => {
    const bookGenres = book.Genres.split(",").map((g) => g.trim());
    const bookLevel = getCEFRLevel(book.Age);

    const genreMatch =
      selectedGenres.length === 0 ||
      bookGenres.some((g) => selectedGenres.includes(g));

    const levelMatch =
      selectedLevels.length === 0 || selectedLevels.includes(bookLevel);

    return genreMatch && levelMatch;
  });

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);

  return (
    <div>
      <FeedWrapper>
        <Header title="Armenian Literature" />

        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? "Hide Options" : "Filter"}
          </Button>
        </div>

        {showFilters && (
  <div className="flex flex-col space-y-6 mt-6">
    <div className="flex gap-6">
      {/* Genre Filter */}
      <div className="w-1/2">
        <h2 className="text-xl font-semibold">Filter by Genre</h2>
        <div className="h-40 overflow-y-auto border rounded p-2">
          <div className="flex flex-col gap-2">
            {allGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1 rounded-md border text-sm text-left ${
                  selectedGenres.includes(genre)
                    ? "bg-green-600 text-white"
                    : "bg-red-100"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Level Filter */}
      <div className="w-1/2">
        <h2 className="text-xl font-semibold">Filter by Level</h2>
        <div className="h-40 overflow-y-auto border rounded p-2">
          <div className="flex flex-col gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => toggleLevel(level)}
                className={`px-3 py-1 rounded-md border text-sm text-left ${
                  selectedLevels.includes(level)
                    ? "bg-green-600 text-white"
                    : "bg-pink-100"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
)}


        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="space-y-4">
              {currentBooks.map((book) => {
                const level = getCEFRLevel(book.Age);
                return (
                  <div key={book._id} className="border p-4 rounded-md shadow-md">
                    <h2 className="text-xl font-semibold">{book.Title}</h2>
                    <p className="text-sm text-gray-600">by {book.Author}</p>
                    <img
                      src={book["Image URL"]}
                      alt={book.Title}
                      className="w-40 mt-2 rounded"
                    />
                    <p className="mt-2 text-sm">{book.Description}</p>
                    <a
                      href={book["Book URL"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-2 block"
                    >
                      Read More
                    </a>
                    <p className="text-sm text-gray-500 mt-1">
                      Age: {book.Age} | Level: {level} | Genres: {book.Genres}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </FeedWrapper>
    </div>
  );
};

export default BooksPage;

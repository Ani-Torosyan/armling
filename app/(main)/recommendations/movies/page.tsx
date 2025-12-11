"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Loading from "../../loading";

// New list of film genres
const allGenres = [
  "Թրիլլեր", "Ռոմանս", "Պատերազմական", "Պատմական", "Կենսագրական",
  "Երիտասարդական", "Ընտանեկան", "Արկածային", "Կատակերգություն",
  "Դրամա", "Մառտաֆիլմ", "Ֆանտաստիկա", "Սարսափ"
];

const FilterPopover = ({
  genres,
  selectedGenres,
  setSelectedGenres,
  fetchFilms,
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
      prev[0] === genre ? [] : [genre]
    );
  };

  return (
    <div className="relative inline-block mb-6">
      <Button variant="secondary" onClick={() => setIsOpen(!isOpen)}>
        Filter
      </Button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 mt-3 w-80 bg-white rounded-xl shadow-lg p-4 space-y-4"
        >
          <div>
            <h3 className="text-sm font-medium mb-2">Genres</h3>
            <div className="max-h-32 overflow-y-auto pr-1 flex flex-wrap gap-2">
              {genres.map((genre: string) => {
                const selected = selectedGenres.includes(genre);
                return (
                  <Button 
                    key={genre}
                    variant={selected ? "sidebarOutline" : "sidebar"}
                    onClick={() => toggleGenre(genre)}
                    className="text-xs px-3 py-1 rounded-full"
                  >
                    {genre}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button variant="sidebar" onClick={() => { fetchFilms(); setIsOpen(false); }} className="w-full">
            Get Recommendations
          </Button>
        </div>
      )}
    </div>
  );
};

const FilmsPage = () => {
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const filmsPerPage = 10;

  const fetchFilms = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("https://film-api-3p85.onrender.com/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genres: selectedGenres }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const json = await res.json();
      if (json.success) {
        setFilms(json.data);
        setCurrentPage(1);
      } else {
        setError("Failed to load films.");
      }
    } catch (err: any) {
      setError("An error occurred while fetching films.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(films.length / filmsPerPage);
  const paginatedFilms = films.slice(
    (currentPage - 1) * filmsPerPage,
    currentPage * filmsPerPage
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = (total: number, current: number) => {
    const pages = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 4) pages.push("...");
      for (
        let i = Math.max(2, current - 1);
        i <= Math.min(total - 1, current + 1);
        i++
      ) {
        pages.push(i);
      }
      if (current < total - 3) pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  const paginationPages = getPageNumbers(totalPages, currentPage);

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 mt-2 text-customDark">Recommended Films</h2>

      <FilterPopover
        genres={allGenres}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
        fetchFilms={fetchFilms}
      />

      {loading && Loading()}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {!loading && !error && films.length === 0 && (
          <p className="text-customShade text-center col-span-full">
            No films to recommend. Please adjust your filters and try again.
          </p>
        )}

        {!loading &&
        !error &&
        paginatedFilms.map((film, idx) => (
          <div
            key={idx}
            className="flex flex-col h-full bg-white shadow rounded-xl overflow-hidden hover:shadow-md transition duration-300"
          >
            <div className="h-64 w-full overflow-hidden bg-gray-100">
              <img
                src={film["poster_url"]}
                alt={film.Title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between flex-grow p-4">
              <h2 className="text-customDark text-lg font-semibold">{film["title"]}</h2>
              <p className="text-customDark text-sm mt-2">Rating: {film.avg_rating?.toFixed(1) || "N/A"}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center mt-10 flex-wrap gap-2 items-center">
          <Button
            variant="ghost"
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <img src="/left.svg" alt="Back" className="w-4 h-4 mr-2" /> Previous
          </Button>

          {paginationPages.map((page, idx) =>
            typeof page === "number" ? (
              <Button
                key={idx}
                onClick={() => handlePageClick(page)}
                variant={currentPage === page ? "sidebarOutline" : "sidebar"}
              >
                {page}
              </Button>
            ) : (
              <span key={idx} className="px-2 text-gray-500 font-semibold select-none">...</span>
            )
          )}

          <Button
            variant="ghost"
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next  <img src="/right.svg" alt="Back" className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilmsPage;

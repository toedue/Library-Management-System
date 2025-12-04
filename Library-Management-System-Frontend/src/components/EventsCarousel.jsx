import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { eventsAPI } from "@/services/api";
import { useTheme } from "@/contexts/ThemeContext";

const EventsCarousel = () => {
  const { isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Default events data
  const defaultEvents = [
    {
      id: 1,
      title: "Library Workshop",
      description: "Learn advanced research techniques and digital resources",
      date: "March 15, 2024",
      time: "2:00 PM - 4:00 PM",
      location: "Main Library Hall",
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      category: "Workshop",
    },
    {
      id: 2,
      title: "Book Reading Session",
      description:
        "Join us for an interactive reading session with local authors",
      date: "March 20, 2024",
      time: "6:00 PM - 8:00 PM",
      location: "Reading Corner",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      category: "Reading",
    },
    {
      id: 3,
      title: "Digital Literacy Program",
      description: "Master digital tools and online research methods",
      date: "March 25, 2024",
      time: "10:00 AM - 12:00 PM",
      location: "Computer Lab",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      category: "Technology",
    },
  ];

  // Load events from backend, fallback to localStorage/default
  const [events, setEvents] = useState(() => {
    try {
      const savedEvents = localStorage.getItem("library-events");
      // console.log(JSON.parse(savedEvents));
      return savedEvents ? JSON.parse(savedEvents) : defaultEvents;
    } catch (error) {
      console.error("Error loading events from localStorage:", error);
      return defaultEvents;
    }
  });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const { data } = await eventsAPI.list();
        if (
          isMounted &&
          Array.isArray(data?.events) &&
          data.events.length > 0
        ) {
          const mapped = data.events.map((e) => ({
            id: e._id,
            title: e.title,
            description: e.description,
            date: e.date,
            time: e.time,
            location: e.location,
            image: e.image?.url || e.image || "",
            category: e.category || "Event",
          }));
          setEvents(mapped);
          try {
            localStorage.setItem("library-events", JSON.stringify(mapped));
          } catch {}
        }
      } catch (err) {
        // Fallback silently to localStorage/default
        console.warn("Failed to load events from backend, using fallback");
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for changes to localStorage (when admin updates events)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedEvents = localStorage.getItem("library-events");
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        }
      } catch (error) {
        console.error("Error loading events from localStorage:", error);
      }
    };

    // Listen for storage events (when localStorage changes in other tabs)
    window.addEventListener("storage", handleStorageChange);

    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying || events.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, events.length]);

  // Ensure auto-play starts when events are loaded
  useEffect(() => {
    if (events.length > 0 && !isAutoPlaying) {
      setIsAutoPlaying(true);
    }
  }, [events.length, isAutoPlaying]);

  const nextSlide = () => {
    if (events.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    if (events.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Handle mouse enter/leave for hover pause
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl h-full">
        <div
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {events.map((event, index) => (
            <div key={event.id} className="w-full flex-shrink-0 h-full">
              <div
                className={`h-full rounded-xl overflow-hidden flex flex-col ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
                style={{
                  boxShadow: isDark
                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                    : "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 0, 0, 0.1)",
                  marginBottom: "12px",
                }}
              >
                {/* Event Image */}
                <div className="relative h-32 overflow-hidden flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isDark
                          ? "bg-blue-600/90 text-white"
                          : "bg-blue-600/90 text-white"
                      }`}
                    >
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className={`text-lg font-bold mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {event.title}
                    </h3>
                    <p
                      className={`text-sm mb-3 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {event.description}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className={`absolute left-2 top-1/3 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
          isDark
            ? "bg-gray-800/80 text-white hover:bg-gray-700/80"
            : "bg-white/80 text-gray-600 hover:bg-gray-100/80"
        } shadow-lg backdrop-blur-sm`}
      >
        <FaChevronLeft size={14} />
      </button>

      <button
        onClick={nextSlide}
        className={`absolute right-2 top-1/3 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
          isDark
            ? "bg-gray-800/80 text-white hover:bg-gray-700/80"
            : "bg-white/80 text-gray-600 hover:bg-gray-100/80"
        } shadow-lg backdrop-blur-sm`}
      >
        <FaChevronRight size={14} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? isDark
                  ? "bg-white"
                  : "bg-gray-600"
                : isDark
                ? "bg-gray-500/50"
                : "bg-gray-300/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventsCarousel;

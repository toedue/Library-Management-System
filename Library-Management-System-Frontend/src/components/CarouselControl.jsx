import React, { useState, useEffect } from "react";
import { FaImage, FaEdit, FaSave, FaPlus, FaTrash, FaEye, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { useTheme } from "@/contexts/ThemeContext";
import { eventsAPI } from "@/services/api";
import toast from "react-hot-toast";

const CarouselControl = () => {
  const { isDark } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(true);
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
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      category: "Workshop"
    },
    {
      id: 2,
      title: "Book Reading Session",
      description: "Join us for an interactive reading session with local authors",
      date: "March 20, 2024",
      time: "6:00 PM - 8:00 PM",
      location: "Reading Corner",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      category: "Reading"
    },
    {
      id: 3,
      title: "Digital Literacy Program",
      description: "Master digital tools and online research methods",
      date: "March 25, 2024",
      time: "10:00 AM - 12:00 PM",
      location: "Computer Lab",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      category: "Technology"
    }
  ];

  // Load events from localStorage or use default
  const [events, setEvents] = useState(() => {
    try {
      const savedEvents = localStorage.getItem('library-events');
      return savedEvents ? JSON.parse(savedEvents) : defaultEvents;
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
      return defaultEvents;
    }
  });

  // Load existing events from backend on mount (fallback to localStorage/default)
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const { data } = await eventsAPI.list();
        if (isMounted && Array.isArray(data?.events) && data.events.length > 0) {
          const mapped = data.events.map(e => ({
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
          try { localStorage.setItem('library-events', JSON.stringify(mapped)); } catch {}
        }
      } catch (err) {
        console.warn('Failed to load events from backend, using fallback');
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  // Pause on hover functionality
  const [isHovered, setIsHovered] = useState(false);
  
  // Auto-slide functionality for preview mode with hover pause
  useEffect(() => {
    if (!isCollapsed || !isAutoPlaying || isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % events.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isCollapsed, isAutoPlaying, isHovered, events.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    image: "",
    category: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setEditForm(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event.id);
    setEditForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      category: event.category
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    try {
      if (!editForm.title || !editForm.description) {
        toast.error("Title and description are required");
        return;
      }
      const payload = {
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        time: editForm.time,
        location: editForm.location,
        category: editForm.category,
        image: imageFile || null,
      };
      const current = events.find(e => e.id === editingEvent);
      if (current && typeof current.id === 'string') {
        await eventsAPI.update(current.id, payload);
        toast.success('Event updated');
      } else {
        await eventsAPI.create(payload);
        toast.success('Event created');
      }
      const { data } = await eventsAPI.list();
      const mapped = Array.isArray(data?.events) ? data.events.map(e => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        image: e.image?.url || e.image || "",
        category: e.category || "Event",
      })) : [];
      if (mapped.length > 0) setEvents(mapped);
      setEditingEvent(null);
      setEditForm({ title: "", description: "", date: "", time: "", location: "", image: "", category: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save event');
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setEditForm({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      image: "",
      category: ""
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = (eventId) => {
    if (events.length <= 1) {
      toast.error("Cannot delete the last event");
      return;
    }
    
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast.success("Event deleted successfully!");
  };

  const handleAddNew = () => {
    const newEvent = {
      id: Math.max(...events.map(e => e.id)) + 1,
      title: "New Event",
      description: "Enter event description",
      date: "TBD",
      time: "TBD",
      location: "TBD",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      category: "General"
    };
    
    setEvents(prev => [...prev, newEvent]);
    setEditingEvent(newEvent.id);
    setEditForm({
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      image: newEvent.image,
      category: newEvent.category
    });
    setImageFile(null);
    setImagePreview(null);
    toast.success("New event draft added. Fill fields then click Create Event.");
  };

  const handleCreate = async () => {
    try {
      if (!editForm.title.trim() || !editForm.description.trim()) {
        toast.error("Title and description are required");
        return;
      }
      const payload = {
        title: editForm.title,
        description: editForm.description,
        date: editForm.date,
        time: editForm.time,
        location: editForm.location,
        category: editForm.category,
        image: imageFile || null,
      };
      await eventsAPI.create(payload);
      toast.success('Event created');
      const { data } = await eventsAPI.list();
      const mapped = Array.isArray(data?.events) ? data.events.map(e => ({
        id: e._id,
        title: e.title,
        description: e.description,
        date: e.date,
        time: e.time,
        location: e.location,
        image: e.image?.url || e.image || "",
        category: e.category || "Event",
      })) : [];
      if (mapped.length > 0) setEvents(mapped);
      setEditingEvent(null);
      setEditForm({ title: "", description: "", date: "", time: "", location: "", image: "", category: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-2xl h-full flex flex-col ${
      isDark ? "bg-gray-800" : "bg-white"
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Post Events
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-lg transition-colors ${
              isDark
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {isCollapsed ? <FaChevronDown size={16} /> : <FaChevronUp size={16} />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNew}
              className={`px-3 py-1.5 rounded text-sm ${
                isDark ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              New Event
            </button>
          </div>
        )}
      </div>

      {isCollapsed ? (
        // Preview Mode - Show carousel like students see
        <div 
          className="flex-1 relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative overflow-hidden rounded-xl h-full">
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {events.map((event, index) => (
                <div key={event.id} className="w-full flex-shrink-0 h-full">
                  <div
                    className={`h-full rounded-xl overflow-hidden shadow-2xl flex flex-col ${
                      isDark ? "bg-gray-700" : "bg-gray-50"
                    }`}
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

          {/* Navigation Arrows for Preview */}
          <button
            onClick={prevSlide}
            className={`absolute left-2 top-1/4 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
              isDark
                ? "bg-gray-700/80 text-white hover:bg-gray-600/80"
                : "bg-white/80 text-gray-600 hover:bg-gray-100/80"
            } shadow-lg backdrop-blur-sm`}
          >
            <FaChevronLeft size={12} />
          </button>

          <button
            onClick={nextSlide}
            className={`absolute right-2 top-1/4 transform -translate-y-1/2 p-1.5 rounded-full transition-all duration-200 ${
              isDark
                ? "bg-gray-700/80 text-white hover:bg-gray-600/80"
                : "bg-white/80 text-gray-600 hover:bg-gray-100/80"
            } shadow-lg backdrop-blur-sm`}
          >
            <FaChevronRight size={12} />
          </button>

          {/* Dots Indicator for Preview */}
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
      ) : (
        // Edit Mode - Show compact grid layout
        <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto">
          {events.map((event, index) => (
          <div
            key={event.id}
            className={`p-2 rounded-lg border ${
              isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="flex gap-2">
                             {/* Event Image - Small */}
               <div className="relative w-16 h-16 flex-shrink-0">
                <img
                  src={editingEvent === event.id ? (imagePreview || editForm.image) : event.image}
                  alt={event.title}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute top-0 left-0">
                  <span className={`px-1 py-0.5 rounded-full text-xs font-semibold ${
                    isDark ? "bg-blue-600/90 text-white" : "bg-blue-600/90 text-white"
                  }`}>
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0">
                {editingEvent === event.id ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder="Title"
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className={`px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className={`px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                    
                    <textarea
                      placeholder="Description"
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={1}
                      className={`w-full px-1.5 py-0.5 rounded border text-xs ${
                        isDark
                          ? "bg-gray-600 border-gray-500 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                    
                    <div className="grid grid-cols-3 gap-1">
                      <input
                        type="text"
                        placeholder="Date"
                        value={editForm.date}
                        onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                        className={`px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Time"
                        value={editForm.time}
                        onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                        className={`px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        className={`px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                    
                    <div className="space-y-0.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={`w-full px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                      <input
                        type="url"
                        placeholder="Image URL"
                        value={editForm.image}
                        onChange={(e) => setEditForm(prev => ({ ...prev, image: e.target.value }))}
                        className={`w-full px-1.5 py-0.5 rounded border text-xs ${
                          isDark
                            ? "bg-gray-600 border-gray-500 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className={`text-xs font-bold mb-0.5 truncate ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {event.title}
                    </h4>
                    <p className={`text-xs mb-1 line-clamp-1 ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}>
                      {event.description}
                    </p>
                    <div className="space-y-0.5 text-xs">
                      <div className={`${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}>
                        📅 {event.date}
                      </div>
                      <div className={`${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}>
                        🕐 {event.time}
                      </div>
                      <div className={`${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}>
                        📍 {event.location}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-0.5">
                {editingEvent === event.id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                      title="Save changes"
                    >
                      <FaSave size={10} />
                    </button>
                    <button
                      onClick={handleCancel}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                      }`}
                      title="Cancel editing"
                    >
                      <FaEye size={10} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(event)}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      title="Edit event"
                    >
                      <FaEdit size={10} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-red-600 hover:bg-red-700 text-white"
                      }`}
                      title="Delete event"
                    >
                      <FaTrash size={10} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          ))}
          
          {/* Create Button at Bottom */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleCreate}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <FaPlus />
              Create Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarouselControl;

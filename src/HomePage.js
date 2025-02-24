import React from 'react';
import GenreSection from '../components/GenreSection';

const HomePage = () => {
  const sections = [
    { title: "Trending Books", query: "books", orderBy: "relevance" },
    { title: "Fiction", query: "subject:fiction" },
    { title: "Mystery", query: "subject:mystery" },
    { title: "Romance", query: "subject:romance" },
    { title: "Science Fiction", query: "subject:science fiction" },
    { title: "Non-fiction", query: "subject:nonfiction" }
  ];

  return (
    <div className="homepage">
      {sections.map((section) => (
        <GenreSection
          key={section.title}
          title={section.title}
          query={section.query}
          orderBy={section.orderBy}
        />
      ))}
    </div>
  );
};

export default HomePage;
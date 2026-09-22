import story from "../data/story.json";

export default function Banner() {
  const { couple, tagline, intro } = story;

  return (
    <div className="banner">
      {/* LEFT COLUMN */}
      <div className="banner-text">
        <h1 className="title">Our Story</h1>
        <h2 className="tagline">{tagline}</h2>

        <p className="start-date">Bắt đầu từ {couple.startDate}</p>
        <button
          className="roll-button"
          onClick={() => {
            document
              .getElementById("journey")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          Roll to Read ↓
        </button>
      </div>

      {/* RIGHT COLUMN */}
      <div className="banner-image">
        <img src="/images/banner.png" alt="Couple" />
      </div>
    </div>
  );
}

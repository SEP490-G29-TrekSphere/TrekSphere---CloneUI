import { stories } from '../data/stories';

export default function HomeStories() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-primary">CÃ¢u chuyá»‡n hÃ nh trÃ¬nh</h2>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <article
              key={story.id}
              className="relative rounded-2xl overflow-hidden h-80 group cursor-pointer"
            >
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(31,57,51,0.1) 0%, rgba(31,57,51,0.85) 100%)',
                }}
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-end">
                <span className="text-xs text-white/80 font-medium uppercase tracking-wider">
                  {story.category}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white leading-snug">{story.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import { ScrollReveal, Slider } from '@/shared/ui';
import { popularDestinations } from '../data/destinations';

export default function HomeDestinations() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary">
            Địa điểm phổ biến
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" scrollOptions={{ delay: 100 }}>
          <div className="mt-12">
            <Slider slidesPerView={4} autoplayInterval={3000}>
              {popularDestinations.map((d) => (
                <div key={d.id} className="destination-item">
                  <div className="destination-image-container group cursor-pointer transition-transform destination-hover">
                    <img src={d.image} alt={d.name} />
                  </div>
                  <span className="mt-3 text-sm font-medium text-center text-muted-foreground">
                    {d.name}
                  </span>
                </div>
              ))}
            </Slider>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

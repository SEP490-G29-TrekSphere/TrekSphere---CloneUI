import { CINEMATIC_ASSETS } from '../../constants/cinematic-scroll';

/**
 * Scene 1 — nền trời/núi/cầu/split-frame + tiêu đề "TREKSPHERE" + đoạn giới thiệu.
 * Thuần presentational: mọi animation đọc CSS var được `useCinematicScrollEngine`
 * ghi lên phần tử `.cinema-scroll` ở component cha, component này không cần nhận
 * prop animation nào.
 */
export function HeroScene() {
  return (
    <>
      <div className="world">
        {/* Sky Background Image */}
        <img className="scene-img sky-img" src={CINEMATIC_ASSETS.sky} alt="" />

        {/* Back Stack Glow Layers */}
        <div className="back-stack">
          <img className="scene-img back-img back-four" src={CINEMATIC_ASSETS.backFour} alt="" />
          <img className="scene-img back-img back-bazaar" src={CINEMATIC_ASSETS.bazaar} alt="" />
        </div>

        {/* Dynamic Tint Shade Overlay */}
        <div className="shade" />

        {/* Scene 1 Hero Title */}
        <h1 className="hero-title">TREKSPHERE</h1>

        {/* Parallax Splitframe & Foreground Layers */}
        <img
          className="scene-img splitframe-img splitframe-left"
          src={CINEMATIC_ASSETS.splitLeft}
          alt=""
        />
        <img
          className="scene-img splitframe-img splitframe-right"
          src={CINEMATIC_ASSETS.splitRight}
          alt=""
        />
        <img className="scene-img bridge-img" src={CINEMATIC_ASSETS.bridge} alt="" />
        <img className="scene-img frame-two-img" src={CINEMATIC_ASSETS.frameTwo} alt="" />
      </div>

      {/* Scene 1 Intro Overview */}
      <section className="intro-copy" aria-label="TrekSphere overview">
        <p>
          Những đỉnh núi hùng vĩ, biển mây bạt ngàn và cộng đồng phượt thủ đam mê đồng hành cùng bạn
          trên mọi nẻo đường thám hiểm.
        </p>
        <nav className="hero-tags" aria-label="TrekSphere highlights">
          <span>Đỉnh Fansipan</span>
          <span>Tà Xùa Sương Mù</span>
          <span>Cực Đông Tổ Quốc</span>
        </nav>
      </section>
    </>
  );
}

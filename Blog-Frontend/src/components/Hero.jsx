import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 100;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (ctx) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const init = () => {
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] w-full flex items-center justify-center overflow-hidden mt-20">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0"
      ></canvas>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 border-4 border-white backdrop-blur-sm bg-black/80">
        <div className="max-w-3xl mx-auto text-center grid gap-8">
          <h1 className="text-4xl sm:text-5xl md:text-7xl leading-none font-['Space_Grotesk'] font-bold tracking-[-1px] animate-[float_6s_ease-in-out_infinite]">
            NEON ECHO <span className="text-[#E5E4E2]">BLOG</span>
          </h1>

          <p className="text-lg leading-relaxed opacity-85 max-w-2xl mx-auto text-white">
            A monochromatic digital space where brutalist design meets futuristic elegance.
            Express your thoughts with stark contrasts and considered minimalism.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Link to="/write-blog">
              <Button className="flex items-center font-['Space_Grotesk'] font-bold py-6 px-8 group">
                START WRITING
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link to="/login">
              <Button 
                variant="outline" 
                className="font-['Space_Grotesk'] py-6 px-8"
              >
                EXPLORE BLOGS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Hero;
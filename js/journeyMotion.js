/**
 * Journey in Motion - Premium Travel Highway Animation
 * Apex Cabs & Tours
 * 
 * Calm, elegant, and realistic travel visual:
 * - Fluid continuous cruising along scenic Western Ghats mountain road
 * - Natural 3D perspective scaling as vehicle ascends into the hills
 * - Soft luminous ambient travel glow following the road
 * - Multi-plane atmospheric depth (misty peaks, clouds, ridges)
 * - Zero map clutter (no pins, no route stepper bars, no navigation HUDs)
 * - Mobile optimized viewport framing with no horizontal overflow
 * - Full prefers-reduced-motion accessibility
 */

export function initJourneyMotion() {
  const heroSection = document.querySelector('.hero');
  const scenicStage = document.getElementById('heroScenicStage');
  const svg = document.getElementById('journeySvg');
  const roadPath = document.getElementById('scenicBaseRoad');
  const highlightPath = document.getElementById('scenicTravelHighlight');
  const vehicle = document.getElementById('journeyVehicle');
  const vehicleChassis = vehicle ? vehicle.querySelector('.vehicle-chassis') : null;
  const headlightBeam1 = document.getElementById('headlightBeam1');
  const headlightBeam2 = document.getElementById('headlightBeam2');

  if (!heroSection || !scenicStage || !roadPath || !vehicle) {
    return;
  }

  // Parallax layers
  const layerMountainsFar = document.getElementById('layerMountainsFar');
  const layerMountainsMid = document.getElementById('layerMountainsMid');
  const layerMountainsNear = document.getElementById('layerMountainsNear');
  const layerForegroundHills = document.getElementById('layerForegroundHills');
  const layerCloudsFar = document.getElementById('layerCloudsFar');
  const layerCloudsMid = document.getElementById('layerCloudsMid');
  const layerRoad = document.getElementById('layerRoad');

  // Calculate road path length
  let totalLength = 980;
  try {
    if (typeof roadPath.getTotalLength === 'function') {
      const measured = roadPath.getTotalLength();
      if (measured > 0) totalLength = measured;
    }
  } catch {
    totalLength = 980;
  }

  // Responsive ViewBox Framing for Mobile vs Desktop
  function adjustResponsiveFraming() {
    if (!svg) return;
    if (window.innerWidth < 992) {
      // Mobile & Tablet: focus on the scenic mountain road, vehicle, and sun
      svg.setAttribute('viewBox', '460 90 940 610');
    } else {
      // Desktop: panoramic widescreen layout with left text safe-zone
      svg.setAttribute('viewBox', '0 0 1400 700');
    }
  }

  adjustResponsiveFraming();

  // Accessibility: Reduced Motion Check
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    try {
      const midPoint = roadPath.getPointAtLength(totalLength * 0.38);
      vehicle.setAttribute('transform', `translate(${midPoint.x.toFixed(2)}, ${midPoint.y.toFixed(2)}) rotate(-20)`);
      vehicle.style.opacity = '1';
    } catch {
      vehicle.setAttribute('transform', 'translate(860, 480) rotate(-20)');
      vehicle.style.opacity = '1';
    }
    if (highlightPath) {
      highlightPath.style.opacity = '0.35';
      highlightPath.style.strokeDasharray = 'none';
    }
    return;
  }

  // Check GSAP and plugins
  const gsapInstance = window.gsap;
  if (!gsapInstance) {
    // Elegant fallback if GSAP is unavailable
    vehicle.style.opacity = '1';
    return;
  }

  if (window.MotionPathPlugin) {
    gsapInstance.registerPlugin(window.MotionPathPlugin);
  }

  // =========================================================================
  // 1. ELEGANT CONTINUOUS TRAVEL MOTION (Looping Cruise)
  // Vehicle moves gracefully along the road path with realistic 3D perspective
  // =========================================================================
  const loopDuration = 16; // Smooth, relaxed luxury pace (seconds)
  const travelTimeline = gsapInstance.timeline({
    repeat: -1,
    defaults: { ease: 'power1.inOut' }
  });

  // Soft fade in as vehicle begins visible section
  travelTimeline.fromTo(
    vehicle,
    {
      opacity: 0,
      motionPath: {
        path: roadPath,
        autoRotate: true,
        align: roadPath,
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 0
      }
    },
    {
      opacity: 1,
      duration: 1.2,
      ease: 'power1.in'
    },
    0
  );

  // Vehicle travels full curve
  travelTimeline.to(
    vehicle,
    {
      motionPath: {
        path: roadPath,
        autoRotate: true,
        align: roadPath,
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 1
      },
      duration: loopDuration,
      ease: 'power1.inOut'
    },
    0
  );

  // 3D Perspective Scaling: vehicle gently recedes in scale as it ascends into distant hills
  if (vehicleChassis) {
    travelTimeline.fromTo(
      vehicleChassis,
      {
        scale: 1.0,
        transformOrigin: '50% 50%'
      },
      {
        scale: 0.62,
        duration: loopDuration,
        ease: 'power1.inOut'
      },
      0
    );
  }

  // Headlight beams soften slightly as vehicle moves into the distance
  if (headlightBeam1 && headlightBeam2) {
    travelTimeline.fromTo(
      [headlightBeam1, headlightBeam2],
      { opacity: 0.5 },
      { opacity: 0.28, duration: loopDuration, ease: 'power1.inOut' },
      0
    );
  }

  // Gentle fade out at the end as vehicle crests the mountain pass
  travelTimeline.to(
    vehicle,
    {
      opacity: 0,
      duration: 1.4,
      ease: 'power1.out'
    },
    loopDuration - 1.4
  );

  // Pause briefly before restarting loop for a natural rhythm
  travelTimeline.to({}, { duration: 1.0 });

  // Soft luminous travel highlight ribbon flowing along the road
  if (highlightPath) {
    const pulseLen = totalLength * 0.32;
    highlightPath.style.strokeDasharray = `${pulseLen} ${totalLength}`;
    
    gsapInstance.fromTo(
      highlightPath,
      {
        strokeDashoffset: pulseLen,
        opacity: 0.2
      },
      {
        strokeDashoffset: -totalLength,
        opacity: 0.75,
        duration: loopDuration,
        ease: 'power1.inOut',
        repeat: -1,
        repeatDelay: 1.0
      }
    );
  }

  // =========================================================================
  // 2. SUBTLE SCROLL PARALLAX (Desktop >= 992px)
  // Gentle natural page flow without trapping or pinning the user
  // =========================================================================
  if (window.ScrollTrigger && window.innerWidth >= 992) {
    gsapInstance.registerPlugin(window.ScrollTrigger);

    if (layerMountainsFar) {
      gsapInstance.to(layerMountainsFar, {
        y: 28,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    }

    if (layerMountainsMid) {
      gsapInstance.to(layerMountainsMid, {
        y: 52,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    }

    if (layerMountainsNear) {
      gsapInstance.to(layerMountainsNear, {
        y: 72,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5
        }
      });
    }
  }

  // =========================================================================
  // 3. RESTRAINED MOUSE PARALLAX ACROSS DEPTH PLANES (Desktop Only)
  // Extremely gentle (1.5 - 4.5px), smooth damping via RAF, auto-centers on leave
  // =========================================================================
  let mouseTargetX = 0;
  let mouseTargetY = 0;
  let mouseCurrentX = 0;
  let mouseCurrentY = 0;
  let mouseRafId = null;
  let isMouseOverHero = false;

  function updateMouseParallax() {
    mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.06;
    mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.06;

    const mx = mouseCurrentX;
    const my = mouseCurrentY;

    if (layerMountainsFar) {
      layerMountainsFar.style.transform = `translate3d(${(mx * 1.8).toFixed(2)}px, ${(my * 1.0).toFixed(2)}px, 0)`;
    }
    if (layerCloudsFar) {
      layerCloudsFar.style.transform = `translate3d(${(mx * 2.4).toFixed(2)}px, ${(my * 1.2).toFixed(2)}px, 0)`;
    }
    if (layerCloudsMid) {
      layerCloudsMid.style.transform = `translate3d(${(mx * 3.0).toFixed(2)}px, ${(my * 1.5).toFixed(2)}px, 0)`;
    }
    if (layerMountainsMid) {
      layerMountainsMid.style.transform = `translate3d(${(mx * 3.4).toFixed(2)}px, ${(my * 1.8).toFixed(2)}px, 0)`;
    }
    if (layerMountainsNear) {
      layerMountainsNear.style.transform = `translate3d(${(mx * 4.6).toFixed(2)}px, ${(my * 2.4).toFixed(2)}px, 0)`;
    }
    if (layerForegroundHills) {
      layerForegroundHills.style.transform = `translate3d(${(mx * 5.5).toFixed(2)}px, ${(my * 2.8).toFixed(2)}px, 0)`;
    }
    if (layerRoad) {
      layerRoad.style.transform = `translate3d(${(mx * 4.8).toFixed(2)}px, ${(my * 2.5).toFixed(2)}px, 0)`;
    }

    if (isMouseOverHero || Math.abs(mx) > 0.002 || Math.abs(my) > 0.002) {
      mouseRafId = requestAnimationFrame(updateMouseParallax);
    } else {
      mouseRafId = null;
    }
  }

  function handleMouseMove(e) {
    if (window.innerWidth < 992) return;
    const rect = scenicStage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseTargetX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    mouseTargetY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

    if (!mouseRafId) {
      mouseRafId = requestAnimationFrame(updateMouseParallax);
    }
  }

  function handleMouseEnter() {
    if (window.innerWidth < 992) return;
    isMouseOverHero = true;
    if (!mouseRafId) {
      mouseRafId = requestAnimationFrame(updateMouseParallax);
    }
  }

  function handleMouseLeave() {
    isMouseOverHero = false;
    mouseTargetX = 0;
    mouseTargetY = 0;
  }

  heroSection.addEventListener('mousemove', handleMouseMove, { passive: true });
  heroSection.addEventListener('mouseenter', handleMouseEnter);
  heroSection.addEventListener('mouseleave', handleMouseLeave);

  // =========================================================================
  // 4. RESIZE RECALCULATION & RESPONSIVE VIEWBOX SWITCHING
  // =========================================================================
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      adjustResponsiveFraming();
      if (window.ScrollTrigger) {
        window.ScrollTrigger.refresh();
      }
    }, 150);
  }, { passive: true });
}

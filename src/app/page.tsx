import Image from "next/image";
import { connection } from "next/server";
import { site, subjects } from "@/content";
import { listApproved, type Testimonial } from "@/lib/store";
import TestimonialButton from "@/components/TestimonialButton";

const subjectClass: Record<Testimonial["subject"], string> = {
  Math: "c-math",
  Spanish: "c-spanish",
  "Computer Science": "c-cs",
  Other: "",
};

async function approvedTestimonials() {
  await connection(); // render on each request so newly approved ones show up
  try {
    return await listApproved();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function Home() {
  const testimonials = await approvedTestimonials();

  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <a className="brand" href="#top">
            {site.name}
          </a>
          <nav className="nav" aria-label="Sections">
            <a href="#subjects">Subjects</a>
            <a href="#about">About</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Book</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap">
            <div>
              <p className="eyebrow">Math · Spanish · Computer Science</p>
              <h1>{site.name}</h1>
              <p className="lede">{site.intro}</p>
              <div className="actions">
                <a className="btn btn-primary" href="#contact">
                  Book a session
                </a>
                <a className="btn" href="#subjects">
                  Subjects
                </a>
              </div>
            </div>
            <div className="portrait">
              <Image
                src="/maria.jpg"
                alt={`Photo of ${site.name}`}
                fill
                priority
                quality={90}
                sizes="(max-width: 860px) 100vw, 540px"
              />
            </div>
          </div>
        </section>

        <section className="section" id="subjects">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2>What I tutor</h2>
              </div>
            </div>
            <div className="subjects">
              {subjects.map((s) => (
                <article key={s.key} className={`subject c-${s.key}`}>
                  <h3>{s.name}</h3>
                  <div>
                    <h4>I can help with</h4>
                    <ul>
                      {s.helpWith.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4>My background</h4>
                    <ul className="creds">
                      {s.background.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="wrap about">
            <h2>About me</h2>
            <div>
              {site.about.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="testimonials">
          <div className="wrap">
            <div className="section-head">
              <div>
                <h2>Testimonials</h2>
                <p className="section-sub">
                  If we&rsquo;ve worked together, I&rsquo;d appreciate you sharing how it went.
                </p>
              </div>
              <TestimonialButton />
            </div>

            {testimonials.length === 0 ? (
              <div className="empty">No testimonials yet.</div>
            ) : (
              <div className="quotes">
                {testimonials.map((t) => (
                  <figure key={t.id} className={`quote ${subjectClass[t.subject]}`}>
                    <blockquote>{t.message}</blockquote>
                    <figcaption>
                      <strong>{t.name}</strong> · {t.role}
                      {t.subject !== "Other" && <> · {t.subject}</>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="wrap contact-inner">
            <div>
              <h2>Book a session</h2>
              <p>Send me an email with the subject and grade level, and we can find a time that works.</p>
            </div>
            <div className="contact-actions">
              <a className="email" href={`mailto:${site.contactEmail}`}>
                {site.contactEmail}
              </a>
              {site.calendlyUrl && (
                <a className="btn btn-light" href={site.calendlyUrl} target="_blank" rel="noreferrer">
                  Schedule on Calendly
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">
          © {new Date().getFullYear()} {site.name}
        </div>
      </footer>
    </>
  );
}

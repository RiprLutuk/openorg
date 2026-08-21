"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="not-found wrap">
      <span>Terjadi kendala</span>
      <h1>Halaman belum dapat dimuat.</h1>
      <p>Silakan coba kembali dalam beberapa saat.</p>
      <button type="button" className="button primary" onClick={reset}>
        Coba kembali
      </button>
    </section>
  );
}

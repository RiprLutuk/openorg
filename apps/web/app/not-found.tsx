import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found wrap">
      <span>404</span>
      <h1>Halaman tidak ditemukan.</h1>
      <p>Tautannya mungkin berubah atau konten belum dipublikasikan.</p>
      <Link className="button primary" href="/">
        Kembali ke beranda
      </Link>
    </section>
  );
}

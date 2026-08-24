"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { type PublicFormState, submitPublicForm } from "@/app/actions";

const initialState: PublicFormState = { status: "idle", message: "" };

export function PublicContactForm() {
  const [state, formAction, pending] = useActionState(
    submitPublicForm,
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Pesan Anda telah berhasil terkirim ke Sekretariat!");
    } else if (state.status === "error") {
      toast.error(state.message || "Gagal mengirimkan pesan.");
    }
  }, [state.status, state.message]);

  if (state.status === "success")
    return (
      <div className="form-success" role="status">
        <span>
          <CheckCircle2 size={25} />
        </span>
        <h3>Pesan Terkirim</h3>
        <p>{state.message}</p>
      </div>
    );

  return (
    <form action={formAction}>
      <label htmlFor="contact-name">
        Nama Lengkap
        <input
          id="contact-name"
          name="name"
          required
          minLength={2}
          maxLength={160}
          autoComplete="name"
          aria-invalid={Boolean(state.errors?.name)}
        />
        {state.errors?.name && (
          <small className="field-error">{state.errors.name}</small>
        )}
      </label>
      <label htmlFor="contact-email">
        Alamat Email
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={320}
          autoComplete="email"
          aria-invalid={Boolean(state.errors?.email)}
        />
        {state.errors?.email && (
          <small className="field-error">{state.errors.email}</small>
        )}
      </label>
      <label htmlFor="contact-website" className="honeypot" aria-hidden="true">
        Website
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
      <label htmlFor="contact-message" className="full">
        Pesan / Pertanyaan Anda
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          minLength={10}
          maxLength={5_000}
          aria-invalid={Boolean(state.errors?.message)}
        />
        {state.errors?.message && (
          <small className="field-error">{state.errors.message}</small>
        )}
      </label>
      {state.status === "error" && (
        <p className="form-error full" role="alert">
          {state.message}
        </p>
      )}
      <button className="button primary" type="submit" disabled={pending}>
        {pending ? "Mengirimkan…" : "Kirim Pesan"} <ArrowRight size={17} />
      </button>
    </form>
  );
}

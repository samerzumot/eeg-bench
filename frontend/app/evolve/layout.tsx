import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Evolve Brain Training — At-Home Neurofeedback Therapy",
  description:
    "Supervised at-home neurofeedback therapy platform by Dr. Upasana Gala (PhD, BCN, QEEG-D). Founder of Evolve Brain Training, Dubai Healthcare City & Abu Dhabi.",
  icons: {
    icon: "/evolve/favicon.svg",
  },
};

export default function EvolveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex-1 flex flex-col">{children}</div>;
}

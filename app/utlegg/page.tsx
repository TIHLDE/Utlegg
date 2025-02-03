"use server";

import SendForm from "../_components/form";

export default async function SendPage() {
  return (
    <div className="flex items-center justify-center mt-20 pb-12">
      <SendForm />
    </div>
  );
};
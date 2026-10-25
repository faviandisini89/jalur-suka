import { facultyById } from "../../data/faculties";

export function Bullet({ facultyId, full }: { facultyId: string; full?: boolean }) {
  const f = facultyById(facultyId);
  return (
    <span className="bullet" data-fac={facultyId} title={f.name}>
      <i />
      {full ? f.name : f.code}
    </span>
  );
}

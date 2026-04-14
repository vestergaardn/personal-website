export default function People() {
  const people = [
    { name: "Emil Kowalski", note: "Animations on web" },
    { name: "Jakub Krehel", note: "Design engineering" },
    { name: "Oliver Hamrin", note: "Brand at Quatr" },
    { name: "DHH", note: "Creator of Ruby on Rails" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div>
        <h1 className="font-bold">People who inspire me</h1>
        <ul className="mt-6 space-y-4">
          {people.map((person) => (
            <li key={person.name}>
              <p className="font-medium">{person.name}</p>
              <p className="text-sm text-gray-500">{person.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

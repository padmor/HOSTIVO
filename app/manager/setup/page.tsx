
import Link from "next/link";
import { getManagerHostel } from "@/lib/manager/context";
import {
  createBed,
  createBuilding,
  createFeePlan,
  createFloor,
  createRoom,
  updateHostel,
} from "@/lib/manager/actions";

type SetupPageProps = {
  searchParams: Promise<{
    hostel?: string;
    message?: string;
    error?: string;
  }>;
};

export default async function ManagerSetupPage({ searchParams }: SetupPageProps) {
  const params = await searchParams;
  const hostelId = params.hostel;

  if (!hostelId) {
    return (
      <main className="page-shell">
        <section className="page-card">
          <h1 className="brand">Hostel setup</h1>
          <p className="subtitle">
            Choose a hostel from the manager dashboard first.
          </p>
          <Link className="primary-button link-button button-auto" href="/manager">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  const { supabase, hostel } = await getManagerHostel(hostelId);

  const { data: buildings, error: buildingsError } = await supabase
    .from("buildings")
    .select("id,name,code")
    .eq("hostel_id", hostel.id)
    .order("name");

  if (buildingsError) {
    throw new Error("Unable to load buildings.");
  }

  const buildingRows = buildings ?? [];
  const buildingIds = buildingRows.map((building) => building.id);

  const { data: floors, error: floorsError } = buildingIds.length
    ? await supabase
        .from("floors")
        .select("id,building_id,name,floor_number")
        .in("building_id", buildingIds)
        .order("floor_number")
    : { data: [], error: null };

  if (floorsError) {
    throw new Error("Unable to load floors.");
  }

  const floorRows = floors ?? [];
  const floorIds = floorRows.map((floor) => floor.id);

  const { data: rooms, error: roomsError } = floorIds.length
    ? await supabase
        .from("rooms")
        .select("id,floor_id,room_number,capacity,status")
        .in("floor_id", floorIds)
        .order("room_number")
    : { data: [], error: null };

  if (roomsError) {
    throw new Error("Unable to load rooms.");
  }

  const roomRows = rooms ?? [];
  const roomIds = roomRows.map((room) => room.id);

  const { data: beds, error: bedsError } = roomIds.length
    ? await supabase
        .from("beds")
        .select("id,room_id,bed_number,status")
        .in("room_id", roomIds)
        .order("bed_number")
    : { data: [], error: null };

  if (bedsError) {
    throw new Error("Unable to load beds.");
  }

  const bedRows = beds ?? [];

  const { data: feePlans, error: feePlansError } = await supabase
    .from("fee_plans")
    .select("id,name,description,amount,currency,starts_at,ends_at,status")
    .eq("hostel_id", hostel.id)
    .order("name");

  if (feePlansError) {
    throw new Error("Unable to load fee plans.");
  }

  const feePlanRows = feePlans ?? [];

  const floorsByBuilding = new Map<string, typeof floorRows>();
  for (const floor of floorRows) {
    const current = floorsByBuilding.get(floor.building_id) ?? [];
    current.push(floor);
    floorsByBuilding.set(floor.building_id, current);
  }

  const roomsByFloor = new Map<string, typeof roomRows>();
  for (const room of roomRows) {
    const current = roomsByFloor.get(room.floor_id) ?? [];
    current.push(room);
    roomsByFloor.set(room.floor_id, current);
  }

  const bedsByRoom = new Map<string, typeof bedRows>();
  for (const bed of bedRows) {
    const current = bedsByRoom.get(bed.room_id) ?? [];
    current.push(bed);
    bedsByRoom.set(bed.room_id, current);
  }

  return (
    <main className="page-shell">
      <section className="page-card wide-card">
        <div className="dashboard-heading">
          <div>
            <p className="eyebrow">Manager setup</p>
            <h1 className="brand">{hostel.name}</h1>
            <p className="subtitle">
              Build the accommodation hierarchy from building to bed, then
              define the fee plans used by tenant applications.
            </p>
          </div>
          <Link className="secondary-button button-auto link-button" href="/manager">
            Dashboard
          </Link>
        </div>

        {params.message ? <div className="notice">{params.message}</div> : null}
        {params.error ? <div className="error">{params.error}</div> : null}

        <div className="setup-grid">
          <section className="setup-section">
            <div className="section-heading">
              <div>
                <h2>Hostel details</h2>
                <p className="meta">Contact details shown to tenants.</p>
              </div>
            </div>
            <form className="form" action={updateHostel}>
              <input type="hidden" name="hostelId" value={hostel.id} />
              <div className="field">
                <label htmlFor="hostel-name">Name</label>
                <input id="hostel-name" name="name" required defaultValue={hostel.name} />
              </div>
              <div className="field">
                <label htmlFor="hostel-location">Location</label>
                <input id="hostel-location" name="location" required defaultValue={hostel.location} />
              </div>
              <div className="field">
                <label htmlFor="hostel-phone">Contact phone</label>
                <input id="hostel-phone" name="contactPhone" defaultValue={hostel.contact_phone ?? ""} />
              </div>
              <div className="field">
                <label htmlFor="hostel-email">Contact email</label>
                <input id="hostel-email" type="email" name="contactEmail" defaultValue={hostel.contact_email ?? ""} />
              </div>
              <button className="primary-button" type="submit">Save hostel details</button>
            </form>
          </section>

          <section className="setup-section">
            <div className="section-heading">
              <div>
                <h2>Add building</h2>
                <p className="meta">Start the physical hierarchy.</p>
              </div>
            </div>
            <form className="form" action={createBuilding}>
              <input type="hidden" name="hostelId" value={hostel.id} />
              <div className="field">
                <label htmlFor="building-name">Building name</label>
                <input id="building-name" name="name" placeholder="Block A" required />
              </div>
              <div className="field">
                <label htmlFor="building-code">Code</label>
                <input id="building-code" name="code" placeholder="A" />
              </div>
              <button className="primary-button" type="submit">Create building</button>
            </form>
          </section>

          <section className="setup-section">
            <div className="section-heading">
              <div>
                <h2>Add floor</h2>
                <p className="meta">Floors stay tied to their building.</p>
              </div>
            </div>
            <form className="form" action={createFloor}>
              <input type="hidden" name="hostelId" value={hostel.id} />
              <div className="field">
                <label htmlFor="floor-building">Building</label>
                <select id="floor-building" name="buildingId" required defaultValue="">
                  <option value="" disabled>Choose a building</option>
                  {buildingRows.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="floor-name">Floor name</label>
                <input id="floor-name" name="name" placeholder="Ground Floor" required />
              </div>
              <div className="field">
                <label htmlFor="floor-number">Floor number</label>
                <input id="floor-number" name="floorNumber" type="number" min="-10" max="200" placeholder="0" />
              </div>
              <button className="primary-button" type="submit" disabled={!buildingRows.length}>
                Create floor
              </button>
            </form>
          </section>

          <section className="setup-section">
            <div className="section-heading">
              <div>
                <h2>Add room</h2>
                <p className="meta">Capacity drives availability.</p>
              </div>
            </div>
            <form className="form" action={createRoom}>
              <input type="hidden" name="hostelId" value={hostel.id} />
              <div className="field">
                <label htmlFor="room-floor">Floor</label>
                <select id="room-floor" name="floorId" required defaultValue="">
                  <option value="" disabled>Choose a floor</option>
                  {floorRows.map((floor) => {
                    const building = buildingRows.find(
                      (item) => item.id === floor.building_id
                    );
                    return (
                      <option key={floor.id} value={floor.id}>
                        {(building?.name ?? "Building") + " — " + floor.name}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="field">
                <label htmlFor="room-number">Room number</label>
                <input id="room-number" name="roomNumber" placeholder="101" required />
              </div>
              <div className="field">
                <label htmlFor="room-capacity">Capacity</label>
                <input id="room-capacity" name="capacity" type="number" min="1" max="50" defaultValue="4" required />
              </div>
              <button className="primary-button" type="submit" disabled={!floorRows.length}>
                Create room
              </button>
            </form>
          </section>

          <section className="setup-section">
            <div className="section-heading">
              <div>
                <h2>Add bed</h2>
                <p className="meta">Beds become the atomic allocation unit.</p>
              </div>
            </div>
            <form className="form" action={createBed}>
              <input type="hidden" name="hostelId" value={hostel.id} />
              <div className="field">
                <label htmlFor="bed-room">Room</label>
                <select id="bed-room" name="roomId" required defaultValue="">
                  <option value="" disabled>Choose a room</option>
                  {roomRows.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number + " — capacity " + room.capacity}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="bed-number">Bed number</label>
                <input id="bed-number" name="bedNumber" placeholder="1" required />
              </div>
              <button className="primary-button" type="submit" disabled={!roomRows.length}>
                Create bed
              </button>
            </form>
          </section>

          <section className="setup-section">
            <div className="section-heading">
              <div>
                <h2>Add fee plan</h2>
                <p className="meta">Use these plans as the basis for charges.</p>
              </div>
            </div>
            <form className="form" action={createFeePlan}>
              <input type="hidden" name="hostelId" value={hostel.id} />
              <div className="field">
                <label htmlFor="fee-name">Plan name</label>
                <input id="fee-name" name="name" placeholder="Academic year" required />
              </div>
              <div className="field">
                <label htmlFor="fee-description">Description</label>
                <input id="fee-description" name="description" placeholder="Standard residential fee" />
              </div>
              <div className="split-fields">
                <div className="field">
                  <label htmlFor="fee-amount">Amount</label>
                  <input id="fee-amount" name="amount" type="number" min="0.01" step="0.01" required />
                </div>
                <div className="field">
                  <label htmlFor="fee-currency">Currency</label>
                  <input id="fee-currency" name="currency" value="GHS" maxLength={3} readOnly />
                </div>
              </div>
              <div className="split-fields">
                <div className="field">
                  <label htmlFor="fee-start">Starts</label>
                  <input id="fee-start" name="startsAt" type="date" />
                </div>
                <div className="field">
                  <label htmlFor="fee-end">Ends</label>
                  <input id="fee-end" name="endsAt" type="date" />
                </div>
              </div>
              <button className="primary-button" type="submit">Create fee plan</button>
            </form>
          </section>
        </div>

        <section className="inventory-section">
          <div className="section-heading">
            <div>
              <h2>Current accommodation structure</h2>
              <p className="meta">
                {buildingRows.length} buildings · {floorRows.length} floors · {roomRows.length} rooms · {bedRows.length} beds
              </p>
            </div>
          </div>

          <div className="stack">
            {buildingRows.map((building) => (
              <article className="hierarchy-card" key={building.id}>
                <h3>
                  {building.name}
                  {building.code ? " (" + building.code + ")" : ""}
                </h3>
                {(floorsByBuilding.get(building.id) ?? []).map((floor) => (
                  <div className="hierarchy-row" key={floor.id}>
                    <strong>{floor.name}</strong>
                    <span className="meta">
                      {(roomsByFloor.get(floor.id) ?? []).length} room(s)
                    </span>
                    <div className="chip-row">
                      {(roomsByFloor.get(floor.id) ?? []).map((room) => (
                        <span className="structure-chip" key={room.id}>
                          {"Room " + room.room_number + " · " + (bedsByRoom.get(room.id) ?? []).length + "/" + room.capacity + " beds"}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </article>
            ))}
            {!buildingRows.length ? (
              <div className="empty-state">
                <p>
                  No buildings yet. Create the first building above to start
                  the hierarchy.
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="inventory-section">
          <div className="section-heading">
            <div>
              <h2>Fee plans</h2>
              <p className="meta">{feePlanRows.length} configured plan(s).</p>
            </div>
          </div>
          <div className="stack">
            {feePlanRows.map((plan) => (
              <article className="list-card" key={plan.id}>
                <div>
                  <h3>{plan.name}</h3>
                  <p className="meta">{plan.description ?? "No description"}</p>
                </div>
                <div className="fee-amount">
                  {Number(plan.amount).toLocaleString()} {plan.currency}
                </div>
              </article>
            ))}
            {!feePlanRows.length ? (
              <div className="empty-state">
                <p>No fee plans yet.</p>
              </div>
            ) : null}
          </div>
        </section>
      </section>
    </main>
  );
}

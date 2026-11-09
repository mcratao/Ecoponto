// POO explícita para a AEP.
// Herança: CollectionPoint e RecyclingEvent herdam de RecyclableDestination.
// Polimorfismo: cada subclasse sobrescreve getTypeLabel().
// Composição: cada destino possui um objeto Address.

class Address {
  constructor(fullAddress, latitude, longitude) {
    this.fullAddress = fullAddress;
    this.latitude = Number(latitude);
    this.longitude = Number(longitude);
  }
}

class RecyclableDestination {
  constructor(id, name, address, materials = []) {
    this.id = id;
    this.name = name;
    this.address = address;
    this.materials = materials;
  }

  getTypeLabel() {
    return "Destino";
  }

  distanceFrom(latitude, longitude) {
    const toRad = deg => deg * Math.PI / 180;
    const R = 6371;
    const lat1 = Number(latitude);
    const lon1 = Number(longitude);
    const lat2 = this.address.latitude;
    const lon2 = this.address.longitude;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
}

class CollectionPoint extends RecyclableDestination {
  constructor(data) {
    super(
      data.id,
      data.name,
      new Address(data.address, data.latitude, data.longitude),
      data.materials || []
    );
    this.category = data.category;
    this.opening_hours = data.opening_hours;
    this.contact = data.contact;
    this.notes = data.notes;
  }

  getTypeLabel() {
    return this.category || "Ponto de coleta";
  }
}

class RecyclingEvent extends RecyclableDestination {
  constructor(data) {
    super(
      data.id,
      data.name,
      new Address(data.address, data.latitude, data.longitude),
      data.materials || []
    );
    this.organizer = data.organizer;
    this.start_at = data.start_at;
    this.end_at = data.end_at;
    this.description = data.description;
  }

  getTypeLabel() {
    return "Evento";
  }
}

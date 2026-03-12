const OPEN5E_BASE = 'https://api.open5e.com/v1';
const DND5E_BASE = 'https://www.dnd5eapi.co/api';

export const api = {
  async getOpen5e(endpoint: string) {
    const res = await fetch(`${OPEN5E_BASE}/${endpoint}`);
    return res.json();
  },
  async getDnd5e(endpoint: string) {
    // Handle the /api/2014 prefix if needed, or just use the endpoint
    const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.replace('/api/', '') : endpoint;
    const res = await fetch(`${DND5E_BASE}/${cleanEndpoint}`);
    return res.json();
  },
  
  // Specific helpers
  async getMonsters(query = '') {
    return this.getOpen5e(`monsters/?search=${query}`);
  },
  async getSpells(query = '') {
    return this.getOpen5e(`spells/?search=${query}`);
  },
  async getClasses() {
    return this.getOpen5e('classes/');
  },
  async getRaces() {
    return this.getOpen5e('races/');
  },
  async getMagicItems(query = '') {
    return this.getOpen5e(`magicitems/?search=${query}`);
  }
};

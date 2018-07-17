const graphqlType_v1 = `
  type Query {
    getDisasterSummary(
      caseLocationDistrict: String,
      caseComplete: Boolean
    ): DisasterSummary
  }
  type DisasterSummary {
    items: [Disaster]
    total: Int
  }
  type Disaster {
    DPID: String,
    DPName: String
    CaseID: String,
    CaseTime: String,
    PName: String,
    CaseLocationDistrict: String,
    CaseLocationDescription: String,
    CaseDescription: String,
    CaseComplete: Boolean,
    Wgs84X: Float,
    Wgs84Y: Float
  }
`;

module.exports = {
  v1: graphqlType_v1
};

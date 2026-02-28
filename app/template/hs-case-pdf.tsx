import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";

interface BoardCasePdfProps {
  contactName: string;
  contactEmail: string;
  caseName: string;
  caseType: string;
  background: string;
  assessment: string;
  recommendation?: string;
  images?: string[];
}

export default function BoardCasePdf({
  contactName,
  contactEmail,
  caseName,
  caseType,
  background,
  assessment,
  recommendation,
  images = [],
}: BoardCasePdfProps) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#fff",
      padding: 40,
      position: "relative",
    },
    column: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "100%",
      margin: 10,
      border: "1px solid #000",
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      margin: 10,
    },
    text: {
      margin: 10,
      fontSize: 12,
    },
    header: {
      fontSize: 16,
      padding: 10,
      textAlign: "center",
      fontWeight: "bold",
    },
    logo: {
      fontSize: 18,
      position: "absolute",
      top: 20,
      left: 20,
      fontWeight: "extrabold",
    },
    title: {
      fontSize: 20,
      textAlign: "center",
      marginTop: 20,
      marginBottom: 20,
      fontWeight: "bold",
    },
    bottomLeftBox: {
      position: "absolute",
      bottom: 20,
      left: 20,
      padding: 10,
      border: "1px solid #000",
      fontSize: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    budgetImage: {
      width: "100%",
      maxHeight: 300,
      objectFit: "contain",
      marginVertical: 5,
    },
    budgetContainer: {
      width: "100%",
      padding: 10,
      marginVertical: 5,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.logo}>TIHLDE</Text>
        <Text style={styles.title}>Innmeldt sak til HS</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.header}>Navn på saken:</Text>
            <Text style={styles.text}>{caseName}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.header}>Type sak:</Text>
            <Text style={styles.text}>{caseType}</Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Kort beskrivelse / bakgrunn:</Text>
          <Text style={styles.text}>{background}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Saksbehandlers vurdering:</Text>
          <Text style={styles.text}>{assessment}</Text>
        </View>

        {recommendation && (
          <View style={styles.column}>
            <Text style={styles.header}>Saksbehandlers innstilling:</Text>
            <Text style={styles.text}>{recommendation}</Text>
          </View>
        )}

        {images.length > 0 && (
          <View style={styles.column}>
            <Text style={styles.header}>Vedlegg:</Text>
            {images.map((image, index) => (
              <View key={index} style={styles.budgetContainer}>
                <Text style={styles.text}>Vedlegg {index + 1}:</Text>
                <Image src={image} style={styles.budgetImage} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomLeftBox}>
          <Text>Saksbehandler:</Text>
          <Text>{contactName}</Text>
          <Text>E-post:</Text>
          <Text>{contactEmail}</Text>
        </View>
      </Page>
    </Document>
  );
}
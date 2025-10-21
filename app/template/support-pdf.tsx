import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
  Link,
} from "@react-pdf/renderer";

interface SupportPdfProps {
  name: string;
  email: string;
  groupName: string;
  purpose: string;
  eventDescription: string;
  justification: string;
  totalAmount: string;
  budgetLink?: string;
  summary?: string;
  signature: string;
  budgetImages: string[];
}

export default function SupportPdf({
  name,
  email,
  groupName,
  purpose,
  eventDescription,
  justification,
  totalAmount,
  budgetLink,
  summary,
  signature,
  budgetImages,
}: SupportPdfProps) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#fff",
      padding: 40,
      position: "relative",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
      textAlign: "center",
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
    link: {
      margin: 10,
      fontSize: 12,
      color: "#0066cc",
      textDecoration: "underline",
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
        <Text style={styles.title}>Søknad om støtte</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.header}>Navn:</Text>
            <Text style={styles.text}>{name}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.header}>E-post:</Text>
            <Text style={styles.text}>{email}</Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Navn på gruppe:</Text>
          <Text style={styles.text}>{groupName}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Totalt søknadsbeløp:</Text>
          <Text style={styles.text}>{totalAmount} NOK</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Formål med søknad:</Text>
          <Text style={styles.text}>{purpose}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Beskrivelse av arrangement/produkt:</Text>
          <Text style={styles.text}>{eventDescription}</Text>
        </View>

        <View style={styles.column}>
          <Text style={styles.header}>Begrunnelse for støtte:</Text>
          <Text style={styles.text}>{justification}</Text>
        </View>

        {budgetLink && (
          <View style={styles.column}>
            <Text style={styles.header}>Lenke til budsjett:</Text>
            <Link src={budgetLink} style={styles.link}>
              {budgetLink}
            </Link>
          </View>
        )}

        {summary && (
          <View style={styles.column}>
            <Text style={styles.header}>Oppsummering:</Text>
            <Text style={styles.text}>{summary}</Text>
          </View>
        )}

        {budgetImages.length > 0 && (
          <View style={styles.column}>
            <Text style={styles.header}>Budsjett:</Text>
            {budgetImages.map((image, index) => (
              <View key={index} style={styles.budgetContainer}>
                <Text style={styles.text}>Budsjettbilde {index + 1}:</Text>
                <Image src={image} style={styles.budgetImage} />
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomLeftBox}>
          <Text>Signatur:</Text>
          <Text>{signature}</Text>
        </View>
      </Page>
    </Document>
  );
}

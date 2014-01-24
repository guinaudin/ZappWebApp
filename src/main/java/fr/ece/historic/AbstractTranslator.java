package fr.ece.historic;

public abstract class AbstractTranslator implements Translator {
    protected final String source;
    protected String translation;

    public AbstractTranslator(String source) {
        this.source = source;
    }

    @Override
    public String getSource() {
        return this.source;
    }
    
    @Override
    public String getTranslation() {
        return this.translation;
    }
    
    @Override
    public String toString() {
        return "source="+getSource()+", translation="+getTranslation();
    }
}
package fr.ece.historic;

import com.sun.corba.se.spi.orbutil.threadpool.Work;

public class WorkTranslatorWrapper implements Translator, Work {
    private final Translator impl;

    public WorkTranslatorWrapper(Translator impl) {
        this.impl = impl;
    }
        
    @Override
    public String getSource() {
        return this.impl.getSource();
    }

    @Override
    public String getTranslation() {
        return this.impl.getTranslation();
    }

    @Override
    public void translate() {
        this.impl.translate();
    }

    public void release() {
    }

    public boolean isDaemon() {
        return false;
    }

    public void run() {
        translate();
    }

    @Override
    public String toString() {
        return this.impl.toString();
    }

    @Override
    public void doWork() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public void setEnqueueTime(long timeInMillis) {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public long getEnqueueTime() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public String getName() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
